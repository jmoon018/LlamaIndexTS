import { lazyLoadTransformers } from "../internal/deps/transformers.js";
import { BaseEmbedding } from "./types.js";

export enum HuggingFaceEmbeddingModelType {
  XENOVA_ALL_MINILM_L6_V2 = "Xenova/all-MiniLM-L6-v2",
  XENOVA_ALL_MPNET_BASE_V2 = "Xenova/all-mpnet-base-v2",
}

/**
 * Uses feature extraction from '@xenova/transformers' to generate embeddings.
 * Per default the model [XENOVA_ALL_MINILM_L6_V2](https://huggingface.co/Xenova/all-MiniLM-L6-v2) is used.
 *
 * Can be changed by setting the `modelType` parameter in the constructor, e.g.:
 * ```
 * new HuggingFaceEmbedding({
 *     modelType: HuggingFaceEmbeddingModelType.XENOVA_ALL_MPNET_BASE_V2,
 * });
 * ```
 *
 * @extends BaseEmbedding
 */
export class HuggingFaceEmbedding extends BaseEmbedding {
  modelType: string = HuggingFaceEmbeddingModelType.XENOVA_ALL_MINILM_L6_V2;
  quantized: boolean = true;

  private extractor: any;

  constructor(init?: Partial<HuggingFaceEmbedding>) {
    super();
    Object.assign(this, init);
  }

  async getExtractor() {
    if (!this.extractor) {
      const { pipeline } = await lazyLoadTransformers();
      this.extractor = await pipeline("feature-extraction", this.modelType, {
        quantized: this.quantized,
      });
    }
    return this.extractor;
  }

  override async getTextEmbedding(text: string): Promise<number[]> {
    const extractor = await this.getExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }

  async getQueryEmbedding(query: string): Promise<number[]> {
    return this.getTextEmbedding(query);
  }
}
