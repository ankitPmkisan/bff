import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  intro,
  outro,
  confirm,
  select,
  spinner,
  isCancel,
  cancel,
  text,
} from "@clack/prompts";
import { EmbeddingsService } from "./modules/embeddings/embeddings.service";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ConfigService } from "@nestjs/config";
import { CreateDocumentDto } from "./modules/embeddings/embeddings.dto";
const { execSync } = require("child_process");
const csv = require("csv-parser");
const pLimit = require("p-limit");
const limit = pLimit(20);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

const readCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const dataArray = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => dataArray.push(data))
      .on("end", () => {
        resolve(dataArray);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};
async function bootstrap() {
  const application = await NestFactory.createApplicationContext(AppModule);
  const configService = application.get(ConfigService);
  const embeddingsService = application.get(EmbeddingsService);

  yargs(hideBin(process.argv))
    .option("debug", {
      alias: "d",
      type: "boolean",
      default: false,
      describe: "Enable debug mode",
    })
    .command("ingest", "Starting Ingestion Process", {}, async (argv) => {
      process.env["DEBUG"] = argv.debug.toString();
      intro(`Starting Ingestion Process for Embeddings`);
      const s = spinner();
      s.start("🚧 1. Download Embeddings CSV");
      const output = execSync(`${configService.get("CLI_DOWNLOAD_CSV")}`, {
        encoding: "utf-8",
      });
      s.stop("✅ 1. AKAI CSV has been downloaded");
      s.start("🚧 2. Setup Embeddings");
      // Read the CSV to create CreateDocumentDto
      const csvFilePath = "akai.csv";
      const jsonData = (await readCSVFile(csvFilePath)) as Array<any>;
      const cdds = [];
      for (const j of jsonData) {
        console.log(j["index"]);
        let cdd: CreateDocumentDto = {
          id: parseInt(j["index"]),
          tags: j["tags"],
          content: j["context"],
        };
        cdds.push(cdd);
      }
      let promises = cdds.map((cdd) => {
        return limit(() => embeddingsService.createOrUpdate([cdd]));
      });
      const result = await Promise.all(promises);
      s.stop("✅ 2. All Embeddings Added to DB");
      outro(`You're all set!`);

      await application.close();
      process.exit(0);
    })
    .demandCommand(1, "Please provide a valid command")
    .help()
    .version()
    .strict()
    .parse();
}

bootstrap();
