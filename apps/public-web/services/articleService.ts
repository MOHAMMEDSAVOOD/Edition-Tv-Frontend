import { articleRepository } from "@/repositories/articleRepository";
import { articleMapper } from "@/mappers/articleMapper";
import { Article } from "@/types/models";

export interface ArticleDetail extends Article {
  headline?: string;
  toxicityScore?: number;
}

export const articleService = {
  async getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
    const dto = await articleRepository.getArticleBySlug(slug);
    if (dto && (dto.headline || dto.title || dto.slug)) {
      return articleMapper.toArticleDetail(dto);
    }
    return null;
  },
};
