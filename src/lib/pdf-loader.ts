import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import type { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import logger from "./logger";

export async function getChunkedDocsFromPDFs(
	pdfDirectoryPath: string,
): Promise<Document<Record<string, unknown>>[]> {
	try {
		/* Load all PDFs within the specified directory */
		const directoryLoader = new DirectoryLoader(pdfDirectoryPath, {
			".pdf": (path: string) => new PDFLoader(path),
		});

		const docs = await directoryLoader.load();
		console.log("pdfLoader load, ", docs);

		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1000,
			chunkOverlap: 200,
		});

		const chunkedDocs = await textSplitter.splitDocuments(docs);

		return chunkedDocs;
	} catch (error) {
		logger.error(`Error loading PDF: ${pdfDirectoryPath} ${error}`);
		throw new Error("Error loading PDF");
	}
}

export async function getChunkedDocsFromPDF(
	pdfPath: string,
): Promise<Document<Record<string, unknown>>[]> {
	try {
		const pdfLoader = new PDFLoader(pdfPath);
		const docs = await pdfLoader.load();
		console.log("pdfLoader load, ", pdfLoader);

		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1000,
			chunkOverlap: 200,
		});

		const chunkedDocs = await textSplitter.splitDocuments(docs);

		return chunkedDocs;
	} catch (error) {
		logger.error(`Error loading PDF: ${pdfPath} ${error}`);
		throw new Error("Error loading PDF");
	}
}
