import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Define the comprehensive OpenAPI 3.0.3 spec matching https://swagger.editiontv.com/specs/backend
const spec = {
  openapi: "3.0.3",
  info: {
    title: "Edition TV Backend API",
    version: "v0",
    description: "Comprehensive OpenAPI 3.0 definition for Edition TV backend services (/specs/backend)"
  },
  servers: [
    {
      url: "https://api.editiontv.com",
      description: "Production API Server"
    },
    {
      url: "http://swagger.editiontv.com",
      description: "Swagger Generated Server"
    }
  ],
  tags: [
    { name: "notification-preference-controller" },
    { name: "moderation-controller" },
    { name: "user-controller" },
    { name: "notification-controller" },
    { name: "wire-item-newsroom-controller" },
    { name: "live-blog-controller" },
    { name: "editorial-governance-controller" },
    { name: "comment-controller" },
    { name: "cms-taxonomy-controller" },
    { name: "article-controller" },
    { name: "platform-admin-controller" },
    { name: "provider-admin-controller" },
    { name: "news-source-admin-controller" },
    { name: "advertisement-controller" },
    { name: "cms-schedule-controller" },
    { name: "platform-users-controller" },
    { name: "search-controller" },
    { name: "saved-article-controller" },
    { name: "news-feed-controller" },
    { name: "media-controller" },
    { name: "taxonomy-extension-controller" },
    { name: "cms-homepage-controller" },
    { name: "cms-edition-controller" },
    { name: "verification-control-plane-controller" },
    { name: "rbac-management-controller" },
    { name: "publication-controller" },
    { name: "location-controller" },
    { name: "editorial-intelligence-controller" },
    { name: "candidate-review-controller" },
    { name: "editorial-production-controller" },
    { name: "homepage-curation-controller" },
    { name: "analytics-controller" },
    { name: "ai-controller" },
    { name: "weather-data-controller" },
    { name: "market-data-controller" },
    { name: "auth-controller" },
    { name: "newsroom-audit-controller" },
    { name: "root-api-controller" }
  ],
  paths: {},
  components: {
    schemas: {}
  }
};

// Helper to create json response ref
function jsonResp(schemaRef, description = "OK") {
  return {
    description,
    content: {
      "application/json": {
        schema: { $ref: `#/components/schemas/${schemaRef}` }
      }
    }
  };
}

function jsonArrayResp(schemaRef, description = "OK") {
  return {
    description,
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: { $ref: `#/components/schemas/${schemaRef}` }
        }
      }
    }
  };
}

function jsonReq(schemaRef, required = true) {
  return {
    required,
    content: {
      "application/json": {
        schema: { $ref: `#/components/schemas/${schemaRef}` }
      }
    }
  };
}

function pathParam(name, type = "string", description = "") {
  return {
    name,
    in: "path",
    required: true,
    description: description || `Identifier for ${name}`,
    schema: { type }
  };
}

function queryParam(name, type = "string", required = false, description = "") {
  return {
    name,
    in: "query",
    required,
    description,
    schema: { type }
  };
}

// 1. Schemas definition
const S = spec.components.schemas;

S.UpdatePreferenceRequestDto = {
  type: "object",
  properties: {
    emailEnabled: { type: "boolean" },
    pushEnabled: { type: "boolean" },
    breakingNewsEnabled: { type: "boolean" },
    newsletterEnabled: { type: "boolean" }
  }
};

S.NotificationPreferenceDto = {
  type: "object",
  properties: {
    userId: { type: "string" },
    emailEnabled: { type: "boolean" },
    pushEnabled: { type: "boolean" },
    breakingNewsEnabled: { type: "boolean" },
    newsletterEnabled: { type: "boolean" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

S.ModerationCaseDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    targetType: { type: "string" },
    targetId: { type: "string" },
    reason: { type: "string" },
    status: { type: "string" },
    createdAt: { type: "string", format: "date-time" }
  }
};

S.UpdateUserProfileRequestDto = {
  type: "object",
  properties: {
    fullName: { type: "string" },
    bio: { type: "string" },
    avatarUrl: { type: "string" }
  }
};

S.UserProfileResponseDto = {
  type: "object",
  properties: {
    userId: { type: "string" },
    fullName: { type: "string" },
    email: { type: "string" },
    avatarUrl: { type: "string" },
    bio: { type: "string" },
    subscriptionTier: { type: "string" },
    renewalDate: { type: "string" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" }
  }
};

S.NotificationResponseDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    userId: { type: "string" },
    title: { type: "string" },
    message: { type: "string" },
    type: { type: "string" },
    isRead: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" }
  }
};

S.WireItemDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    source: { type: "string" },
    headline: { type: "string" },
    body: { type: "string" },
    category: { type: "string" },
    isStarred: { type: "boolean" },
    isRead: { type: "boolean" },
    status: { type: "string" },
    publishedAt: { type: "string", format: "date-time" },
    createdAt: { type: "string", format: "date-time" }
  }
};

S.UpdateLiveBlogStatusRequestDto = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["DRAFT", "ACTIVE", "PAUSED", "CONCLUDED", "ARCHIVED"] }
  }
};

S.LiveBlogResponseDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    slug: { type: "string" },
    summary: { type: "string" },
    status: { type: "string" },
    coverImageUrl: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

S.UpdateRightOfResponseRequest = {
  type: "object",
  properties: {
    status: { type: "string" },
    responseContent: { type: "string" }
  }
};

S.RightOfResponseCaseJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    articleId: { type: "string" },
    claimantName: { type: "string" },
    status: { type: "string" },
    createdAt: { type: "string", format: "date-time" }
  }
};

S.UpdateCommentRequestDto = {
  type: "object",
  properties: {
    content: { type: "string" }
  }
};

S.CommentDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    articleId: { type: "string" },
    userId: { type: "string" },
    authorName: { type: "string" },
    content: { type: "string" },
    likeCount: { type: "integer" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

S.CommentRevisionDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    commentId: { type: "string" },
    content: { type: "string" },
    createdAt: { type: "string", format: "date-time" }
  }
};

S.CreateDeskRequestDto = {
  type: "object",
  properties: {
    name: { type: "string" },
    slug: { type: "string" },
    description: { type: "string" }
  },
  required: ["name", "slug"]
};

S.NewsroomDeskJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    slug: { type: "string" },
    description: { type: "string" }
  }
};

S.CreateCategoryRequestDto = {
  type: "object",
  properties: {
    name: { type: "string" },
    slug: { type: "string" },
    description: { type: "string" }
  },
  required: ["name", "slug"]
};

S.Category = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    slug: { type: "string" },
    description: { type: "string" }
  }
};

S.UpdateArticleRequest = {
  type: "object",
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    body: { type: "string" },
    category: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    heroImageUrl: { type: "string" }
  }
};

S.ArticleResponse = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    slug: { type: "string" },
    summary: { type: "string" },
    body: { type: "string" },
    category: { type: "string" },
    status: { type: "string" },
    publishedAt: { type: "string", format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

S.UpdateStatusRequest = {
  type: "object",
  properties: {
    status: { type: "string" }
  },
  required: ["status"]
};

S.UpdateRoleRequest = {
  type: "object",
  properties: {
    name: { type: "string" },
    permissions: { type: "array", items: { type: "string" } }
  }
};

S.UpdateProviderConfigRequestDto = {
  type: "object",
  properties: {
    enabled: { type: "boolean" },
    endpointUrl: { type: "string" },
    pollingIntervalSeconds: { type: "integer" },
    rateLimitPerMinute: { type: "integer" }
  }
};

S.ProviderConfigResponseDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    providerKey: { type: "string" },
    name: { type: "string" },
    providerType: { type: "string" },
    endpointUrl: { type: "string" },
    enabled: { type: "boolean" },
    priority: { type: "integer" },
    pollingIntervalSeconds: { type: "integer" },
    rateLimitPerMinute: { type: "integer" },
    quotaPerDay: { type: "integer" },
    quotaUsedToday: { type: "integer" },
    healthStatus: { type: "string" },
    consecutiveFailures: { type: "integer" },
    licensingAttribution: { type: "string" },
    lastFetchAt: { type: "string" },
    lastSuccessfulFetchAt: { type: "string" }
  }
};

S.NewsFeedDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    slug: { type: "string" },
    excerpt: { type: "string" },
    category: { type: "string" },
    heroImageUrl: { type: "string" },
    publishedAt: { type: "string", format: "date-time" }
  }
};

S.NewsSourceDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    feedUrl: { type: "string" },
    enabled: { type: "boolean" },
    category: { type: "string" }
  }
};

S.IngestionRetentionConfigEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    retentionDays: { type: "integer" },
    autoPurgeEnabled: { type: "boolean" }
  }
};

S.UpdateCampaignRequestDto = {
  type: "object",
  properties: {
    name: { type: "string" },
    status: { type: "string" },
    budget: { type: "number" }
  }
};

S.CampaignDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    status: { type: "string" },
    impressions: { type: "integer" },
    clicks: { type: "integer" }
  }
};

S.UserModerationRequestDto = {
  type: "object",
  properties: {
    reason: { type: "string" },
    durationDays: { type: "integer" }
  }
};

S.UserModerationRecordDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    userId: { type: "string" },
    action: { type: "string" },
    reason: { type: "string" },
    createdAt: { type: "string", format: "date-time" }
  }
};

S.SchedulePublishRequestDto = {
  type: "object",
  properties: {
    articleId: { type: "string" },
    publishAt: { type: "string", format: "date-time" }
  }
};

S.PublishingSchedule = {
  type: "object",
  properties: {
    id: { type: "string" },
    articleId: { type: "string" },
    publishAt: { type: "string", format: "date-time" },
    status: { type: "string" }
  }
};

S.ScheduleProcessResponseDto = {
  type: "object",
  properties: {
    processedCount: { type: "integer" },
    successCount: { type: "integer" }
  }
};

S.RecordReadingRequestDto = {
  type: "object",
  properties: {
    articleId: { type: "string" },
    durationSeconds: { type: "integer" }
  }
};

S.UserReadingHistoryJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    userId: { type: "string" },
    articleId: { type: "string" },
    readAt: { type: "string", format: "date-time" }
  }
};

S.CreateUserRequest = {
  type: "object",
  properties: {
    username: { type: "string" },
    email: { type: "string" },
    password: { type: "string" },
    roles: { type: "array", items: { type: "string" } }
  }
};

S.IndexDocumentRequestDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    content: { type: "string" }
  }
};

S.ReindexResponseDto = {
  type: "object",
  properties: {
    indexedCount: { type: "integer" },
    status: { type: "string" }
  }
};

S.SearchDocument = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    snippet: { type: "string" },
    category: { type: "string" }
  }
};

S.SavedArticleJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    userId: { type: "string" },
    articleId: { type: "string" },
    savedAt: { type: "string", format: "date-time" }
  }
};

S.SaveArticleRequestDto = {
  type: "object",
  properties: {
    articleId: { type: "string" }
  }
};

S.SendNotificationRequestDto = {
  type: "object",
  properties: {
    userId: { type: "string" },
    title: { type: "string" },
    message: { type: "string" }
  }
};

S.DirectPublishRequestDto = {
  type: "object",
  properties: {
    itemIds: { type: "array", items: { type: "string" } }
  }
};

S.DirectPublishResponseDto = {
  type: "object",
  properties: {
    publishedCount: { type: "integer" },
    status: { type: "string" }
  }
};

S.CreateBreakingNewsRequestDto = {
  type: "object",
  properties: {
    headline: { type: "string" },
    linkUrl: { type: "string" },
    severity: { type: "string" }
  }
};

S.BreakingNewsTickerResponseDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    headline: { type: "string" },
    linkUrl: { type: "string" },
    createdAt: { type: "string", format: "date-time" }
  }
};

S.CreateMediaRequest = {
  type: "object",
  properties: {
    title: { type: "string" },
    mimeType: { type: "string" },
    url: { type: "string" }
  }
};

S.MediaAssetJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    url: { type: "string" },
    mimeType: { type: "string" }
  }
};

S.MediaMetadataJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    mediaId: { type: "string" },
    key: { type: "string" },
    value: { type: "string" }
  }
};

S.MediaVariantJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    mediaId: { type: "string" },
    resolution: { type: "string" },
    url: { type: "string" }
  }
};

S.AddLiveBlogEntryRequestDto = {
  type: "object",
  properties: {
    content: { type: "string" },
    author: { type: "string" },
    isKeyEvent: { type: "boolean" }
  }
};

S.LiveBlogEntryResponseDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    liveBlogId: { type: "string" },
    content: { type: "string" },
    author: { type: "string" },
    isKeyEvent: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" }
  }
};

S.CreateLiveBlogRequestDto = {
  type: "object",
  properties: {
    title: { type: "string" },
    slug: { type: "string" },
    summary: { type: "string" }
  }
};

S.CreateRightOfResponseRequest = {
  type: "object",
  properties: {
    articleId: { type: "string" },
    claimantName: { type: "string" },
    details: { type: "string" }
  }
};

S.DistributionJobJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    articleId: { type: "string" },
    channel: { type: "string" },
    status: { type: "string" }
  }
};

S.IssuePublicCorrectionRequest = {
  type: "object",
  properties: {
    articleId: { type: "string" },
    correctionText: { type: "string" }
  }
};

S.PublicCorrectionJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    articleId: { type: "string" },
    correctionText: { type: "string" },
    issuedAt: { type: "string", format: "date-time" }
  }
};

S.RegisterContentRightsRequest = {
  type: "object",
  properties: {
    articleId: { type: "string" },
    rightsHolder: { type: "string" },
    licenseType: { type: "string" }
  }
};

S.ContentRightsLicenseJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    articleId: { type: "string" },
    rightsHolder: { type: "string" },
    licenseType: { type: "string" }
  }
};

S.LogAiProvenanceRequest = {
  type: "object",
  properties: {
    articleId: { type: "string" },
    modelName: { type: "string" },
    promptDigest: { type: "string" }
  }
};

S.AiProvenanceJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    articleId: { type: "string" },
    modelName: { type: "string" },
    loggedAt: { type: "string", format: "date-time" }
  }
};

S.ReportCommentRequestDto = {
  type: "object",
  properties: {
    reason: { type: "string" }
  }
};

S.CommentReportDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    commentId: { type: "string" },
    reason: { type: "string" }
  }
};

S.CreateReplyRequestDto = {
  type: "object",
  properties: {
    parentCommentId: { type: "string" },
    content: { type: "string" }
  }
};

S.CreateGeographyRequest = {
  type: "object",
  properties: {
    name: { type: "string" },
    slug: { type: "string" },
    parentId: { type: "string" }
  }
};

S.GeographyNodeJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    slug: { type: "string" }
  }
};

S.CreateEntityRequest = {
  type: "object",
  properties: {
    name: { type: "string" },
    entityType: { type: "string" }
  }
};

S.DomainEntityJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    entityType: { type: "string" }
  }
};

S.AssociateEntityRequest = {
  type: "object",
  properties: {
    entityId: { type: "string" }
  }
};

S.ArticleEntityMappingJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    articleId: { type: "string" },
    entityId: { type: "string" }
  }
};

S.CreateBeatRequest = {
  type: "object",
  properties: {
    name: { type: "string" },
    deskId: { type: "string" }
  }
};

S.NewsroomBeatJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    deskId: { type: "string" }
  }
};

S.CreateTagRequestDto = {
  type: "object",
  properties: {
    name: { type: "string" },
    slug: { type: "string" }
  }
};

S.Tag = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    slug: { type: "string" }
  }
};

S.AssignSlotRequestDto = {
  type: "object",
  properties: {
    slotNumber: { type: "integer" },
    articleId: { type: "string" }
  }
};

S.HomepageSlot = {
  type: "object",
  properties: {
    id: { type: "string" },
    slotNumber: { type: "integer" },
    articleId: { type: "string" }
  }
};

S.CreateSectionRequestDto = {
  type: "object",
  properties: {
    title: { type: "string" },
    layoutType: { type: "string" }
  }
};

S.Section = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    layoutType: { type: "string" }
  }
};

S.CreateHomepageRequestDto = {
  type: "object",
  properties: {
    title: { type: "string" },
    editionId: { type: "string" }
  }
};

S.Homepage = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    editionId: { type: "string" }
  }
};

S.ScheduleEditionRequestDto = {
  type: "object",
  properties: {
    scheduledAt: { type: "string", format: "date-time" }
  }
};

S.Edition = {
  type: "object",
  properties: {
    id: { type: "string" },
    code: { type: "string" },
    name: { type: "string" },
    status: { type: "string" }
  }
};

S.CreateEditionRequestDto = {
  type: "object",
  properties: {
    code: { type: "string" },
    name: { type: "string" }
  }
};

S.CreateCollectionRequestDto = {
  type: "object",
  properties: {
    title: { type: "string" },
    slug: { type: "string" }
  }
};

S.Collection = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    slug: { type: "string" }
  }
};

S.CreateCommentRequestDto = {
  type: "object",
  properties: {
    content: { type: "string" }
  },
  required: ["content"]
};

S.CreateArticleRequest = {
  type: "object",
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    body: { type: "string" },
    category: { type: "string" }
  },
  required: ["title"]
};

S.SourceReliabilityJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    sourceName: { type: "string" },
    score: { type: "number" }
  }
};

S.LiveNewsUpdateJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    eventId: { type: "string" },
    content: { type: "string" },
    createdAt: { type: "string", format: "date-time" }
  }
};

S.LiveNewsEventJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    status: { type: "string" }
  }
};

S.PublicationGateJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    articleId: { type: "string" },
    gateType: { type: "string" },
    passed: { type: "boolean" }
  }
};

S.EditorialEvidenceJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    articleId: { type: "string" },
    evidenceType: { type: "string" },
    uri: { type: "string" }
  }
};

S.CloneRoleRequest = {
  type: "object",
  properties: {
    sourceRoleId: { type: "string" },
    targetRoleName: { type: "string" }
  }
};

S.RoleDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    permissions: { type: "array", items: { type: "string" } }
  }
};

S.CreateRoleRequest = {
  type: "object",
  properties: {
    name: { type: "string" },
    permissions: { type: "array", items: { type: "string" } }
  }
};

S.TriggerPublicationJobRequest = {
  type: "object",
  properties: {
    articleId: { type: "string" },
    target: { type: "string" }
  }
};

S.PublicationJobJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    articleId: { type: "string" },
    status: { type: "string" }
  }
};

S.NormalizedStoryDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    headline: { type: "string" },
    body: { type: "string" }
  }
};

S.TestFetchResponseDto = {
  type: "object",
  properties: {
    status: { type: "string" },
    fetchedItemsCount: { type: "integer" }
  }
};

S.RegisterCredentialRequestDto = {
  type: "object",
  properties: {
    apiKey: { type: "string" },
    apiSecret: { type: "string" }
  }
};

S.IngestionRunDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    sourceId: { type: "string" },
    status: { type: "string" },
    itemsIngested: { type: "integer" }
  }
};

S.TestFeedResultDto = {
  type: "object",
  properties: {
    valid: { type: "boolean" },
    message: { type: "string" }
  }
};

S.RetentionPurgeResultDto = {
  type: "object",
  properties: {
    purgedCount: { type: "integer" },
    durationMs: { type: "integer" }
  }
};

S.OpmlImportResultDto = {
  type: "object",
  properties: {
    importedFeeds: { type: "integer" },
    failedFeeds: { type: "integer" }
  }
};

S.DynamicOpmlSubscriptionEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    url: { type: "string" },
    name: { type: "string" }
  }
};

S.NewsSourceLabelEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    color: { type: "string" }
  }
};

S.CreatePostalCodeMappingRequest = {
  type: "object",
  properties: {
    postalCode: { type: "string" },
    cityId: { type: "string" }
  }
};

S.LocationPostalCodeJpaEntity = {
  type: "object",
  properties: {
    postalCode: { type: "string" },
    cityId: { type: "string" }
  }
};

S.ImportLocationDto = {
  type: "object",
  properties: {
    name: { type: "string" },
    countryCode: { type: "string" }
  }
};

S.LocationImportJobJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    status: { type: "string" },
    importedCount: { type: "integer" }
  }
};

S.CandidateResponseDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    source: { type: "string" },
    status: { type: "string" },
    confidenceScore: { type: "number" }
  }
};

S.ConvertCandidateRequestDto = {
  type: "object",
  properties: {
    candidateId: { type: "string" },
    deskId: { type: "string" }
  }
};

S.AssignCandidateRequestDto = {
  type: "object",
  properties: {
    deskId: { type: "string" },
    reporterId: { type: "string" }
  }
};

S.CreatePlanningEventRequest = {
  type: "object",
  properties: {
    title: { type: "string" },
    eventDate: { type: "string", format: "date-time" }
  }
};

S.NewsroomPlanningEventJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    eventDate: { type: "string", format: "date-time" }
  }
};

S.CreateCommentRequest = {
  type: "object",
  properties: {
    content: { type: "string" }
  }
};

S.NewsroomCommentJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    content: { type: "string" },
    author: { type: "string" }
  }
};

S.EditorialAssignmentJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    articleId: { type: "string" },
    assigneeId: { type: "string" },
    status: { type: "string" }
  }
};

S.CreateAssignmentRequest = {
  type: "object",
  properties: {
    articleId: { type: "string" },
    assigneeId: { type: "string" }
  }
};

S.ArticleRevisionJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    articleId: { type: "string" },
    revisionNumber: { type: "integer" },
    content: { type: "string" }
  }
};

S.CreateRevisionRequest = {
  type: "object",
  properties: {
    content: { type: "string" }
  }
};

S.ArticleLockJpaEntity = {
  type: "object",
  properties: {
    articleId: { type: "string" },
    lockedBy: { type: "string" },
    lockedAt: { type: "string", format: "date-time" }
  }
};

S.CreateCorrectionRequest = {
  type: "object",
  properties: {
    correctionText: { type: "string" }
  }
};

S.ArticleCorrectionJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    articleId: { type: "string" },
    correctionText: { type: "string" }
  }
};

S.HomepagePlacementJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    slotType: { type: "string" },
    articleId: { type: "string" },
    orderIndex: { type: "integer" }
  }
};

S.SimulateRequest = {
  type: "object",
  properties: {
    userId: { type: "string" },
    permission: { type: "string" }
  }
};

S.AuthorizationSimulationResult = {
  type: "object",
  properties: {
    authorized: { type: "boolean" },
    reasons: { type: "array", items: { type: "string" } }
  }
};

S.TrackViewRequestDto = {
  type: "object",
  properties: {
    articleId: { type: "string" },
    referrer: { type: "string" }
  }
};

S.ArticleAnalyticsDto = {
  type: "object",
  properties: {
    articleId: { type: "string" },
    totalViews: { type: "integer" },
    uniqueVisitors: { type: "integer" }
  }
};

S.SummaryRequestDto = {
  type: "object",
  properties: {
    text: { type: "string" },
    maxLength: { type: "integer" }
  }
};

S.SummaryResult = {
  type: "object",
  properties: {
    summary: { type: "string" }
  }
};

S.TokenUsage = {
  type: "object",
  properties: {
    promptTokens: { type: "integer" },
    completionTokens: { type: "integer" },
    totalTokens: { type: "integer" }
  }
};

S.SeoRequestDto = {
  type: "object",
  properties: {
    title: { type: "string" },
    body: { type: "string" }
  }
};

S.SeoResult = {
  type: "object",
  properties: {
    seoTitle: { type: "string" },
    metaDescription: { type: "string" },
    keywords: { type: "array", items: { type: "string" } }
  }
};

S.HeadlineRequestDto = {
  type: "object",
  properties: {
    storyText: { type: "string" }
  }
};

S.HeadlineResult = {
  type: "object",
  properties: {
    headlines: { type: "array", items: { type: "string" } }
  }
};

S.CompletionRequestDto = {
  type: "object",
  properties: {
    systemPrompt: { type: "string" },
    userPrompt: { type: "string" },
    provider: { type: "string" },
    modelName: { type: "string" },
    temperature: { type: "number" },
    maxTokens: { type: "integer" }
  }
};

S.LlmResponse = {
  type: "object",
  properties: {
    content: { type: "string" },
    finishReason: { type: "string" },
    tokenUsage: { $ref: "#/components/schemas/TokenUsage" },
    providerName: { type: "string" }
  }
};

S.CreateAdRequestDto = {
  type: "object",
  properties: {
    campaignId: { type: "string" },
    imageUrl: { type: "string" },
    targetUrl: { type: "string" }
  }
};

S.AdvertisementDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    campaignId: { type: "string" },
    imageUrl: { type: "string" },
    targetUrl: { type: "string" }
  }
};

S.CreateCampaignRequestDto = {
  type: "object",
  properties: {
    name: { type: "string" },
    budget: { type: "number" }
  }
};

S.CityWeatherResponseDto = {
  type: "object",
  properties: {
    city: { type: "string" },
    tempC: { type: "number" },
    condition: { type: "string" }
  }
};

S.UserSummaryDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    username: { type: "string" },
    email: { type: "string" }
  }
};

S.SearchHitItem = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    score: { type: "number" }
  }
};

S.SearchResultPage = {
  type: "object",
  properties: {
    items: { type: "array", items: { $ref: "#/components/schemas/SearchHitItem" } },
    totalHits: { type: "integer" }
  }
};

S.BookmarkStatusDto = {
  type: "object",
  properties: {
    articleId: { type: "string" },
    isSaved: { type: "boolean" }
  }
};

S.ArticleEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    slug: { type: "string" },
    body: { type: "string" }
  }
};

S.ReaderStatsDto = {
  type: "object",
  properties: {
    totalArticlesRead: { type: "integer" },
    activeDaysCount: { type: "integer" }
  }
};

S.PageWireItemDto = {
  type: "object",
  properties: {
    content: { type: "array", items: { $ref: "#/components/schemas/WireItemDto" } },
    totalElements: { type: "integer" }
  }
};

S.PageableObject = {
  type: "object",
  properties: {
    pageNumber: { type: "integer" },
    pageSize: { type: "integer" }
  }
};

S.SortObject = {
  type: "object",
  properties: {
    sorted: { type: "boolean" }
  }
};

S.OptionItemDto = {
  type: "object",
  properties: {
    label: { type: "string" },
    value: { type: "string" }
  }
};

S.PlacementOptionDto = {
  type: "object",
  properties: {
    slotName: { type: "string" },
    options: { type: "array", items: { $ref: "#/components/schemas/OptionItemDto" } }
  }
};

S.PublicationConfigDto = {
  type: "object",
  properties: {
    autoPublishEnabled: { type: "boolean" }
  }
};

S.FeedItemResponseDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    slug: { type: "string" },
    category: { type: "string" }
  }
};

S.MarketSnapshotResponseDto = {
  type: "object",
  properties: {
    indices: {
      type: "array",
      items: {
        type: "object",
        properties: {
          symbol: { type: "string" },
          value: { type: "number" },
          changePercent: { type: "number" }
        }
      }
    }
  }
};

S.ReverseGeocodeResult = {
  type: "object",
  properties: {
    formattedAddress: { type: "string" },
    city: { type: "string" },
    country: { type: "string" }
  }
};

S.GeocodeResult = {
  type: "object",
  properties: {
    lat: { type: "number" },
    lng: { type: "number" },
    formattedAddress: { type: "string" }
  }
};

S.CurrentUserDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    username: { type: "string" },
    email: { type: "string" },
    firstName: { type: "string" },
    lastName: { type: "string" },
    roles: { type: "array", items: { type: "string" } }
  }
};

S.StoryClaimJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    claimText: { type: "string" },
    verified: { type: "boolean" }
  }
};

S.NewsroomDeskResponseDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    slug: { type: "string" }
  }
};

S.NewsroomDashboardMetricsDto = {
  type: "object",
  properties: {
    totalStoriesInFlight: { type: "integer" },
    publishedToday: { type: "integer" }
  }
};

S.JournalistBriefDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    clusterId: { type: "string" },
    summary: { type: "string" }
  }
};

S.ClusterDetailResponseDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    topic: { type: "string" },
    sourcesCount: { type: "integer" }
  }
};

S.ExternalArticleCandidateJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    headline: { type: "string" },
    source: { type: "string" }
  }
};

S.StoryClusterJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    clusterName: { type: "string" }
  }
};

S.StoryEntityJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    entityName: { type: "string" }
  }
};

S.PageStoryClusterJpaEntity = {
  type: "object",
  properties: {
    content: { type: "array", items: { $ref: "#/components/schemas/StoryClusterJpaEntity" } }
  }
};

S.PageCandidateResponseDto = {
  type: "object",
  properties: {
    content: { type: "array", items: { $ref: "#/components/schemas/CandidateResponseDto" } }
  }
};

S.NewsroomAuditLogJpaEntity = {
  type: "object",
  properties: {
    id: { type: "string" },
    action: { type: "string" },
    performedBy: { type: "string" },
    timestamp: { type: "string", format: "date-time" }
  }
};

S.PageNewsroomAuditLogJpaEntity = {
  type: "object",
  properties: {
    content: { type: "array", items: { $ref: "#/components/schemas/NewsroomAuditLogJpaEntity" } }
  }
};

S.TrendingArticleDto = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    score: { type: "number" }
  }
};

S.AnalyticsDashboardDto = {
  type: "object",
  properties: {
    totalPageViews: { type: "integer" },
    activeUsers: { type: "integer" }
  }
};

S.AuthorAnalyticsDto = {
  type: "object",
  properties: {
    authorId: { type: "string" },
    articleCount: { type: "integer" },
    totalViews: { type: "integer" }
  }
};

S.ServeAdResponseDto = {
  type: "object",
  properties: {
    adId: { type: "string" },
    creativeUrl: { type: "string" },
    targetUrl: { type: "string" }
  }
};

// 2. Paths definition
const P = spec.paths;

function addPath(p, method, op) {
  if (!P[p]) P[p] = {};
  P[p][method.toLowerCase()] = op;
}

// Notification Preference
addPath("/notifications/preferences", "get", {
  tags: ["notification-preference-controller"],
  operationId: "getUserPreferences",
  responses: { 200: jsonResp("NotificationPreferenceDto") }
});
addPath("/notifications/preferences", "put", {
  tags: ["notification-preference-controller"],
  operationId: "updatePreferences",
  requestBody: jsonReq("UpdatePreferenceRequestDto"),
  responses: { 200: jsonResp("NotificationPreferenceDto") }
});

// Moderation
addPath("/moderation/comments/{id}/reject", "put", {
  tags: ["moderation-controller"],
  operationId: "rejectComment",
  parameters: [pathParam("id")],
  responses: { 200: { description: "Comment rejected" } }
});
addPath("/moderation/comments/{id}/hide", "put", {
  tags: ["moderation-controller"],
  operationId: "hideComment",
  parameters: [pathParam("id")],
  responses: { 200: { description: "Comment hidden" } }
});
addPath("/moderation/comments/{id}/delete", "put", {
  tags: ["moderation-controller"],
  operationId: "deleteComment",
  parameters: [pathParam("id")],
  responses: { 200: { description: "Comment deleted" } }
});
addPath("/moderation/comments/{id}/approve", "put", {
  tags: ["moderation-controller"],
  operationId: "approveComment",
  parameters: [pathParam("id")],
  responses: { 200: { description: "Comment approved" } }
});
addPath("/moderation/users/{id}/warning", "post", {
  tags: ["moderation-controller"],
  operationId: "warnUser",
  parameters: [pathParam("id")],
  requestBody: jsonReq("UserModerationRequestDto"),
  responses: { 200: jsonResp("UserModerationRecordDto") }
});
addPath("/moderation/users/{id}/mute", "post", {
  tags: ["moderation-controller"],
  operationId: "muteUser",
  parameters: [pathParam("id")],
  requestBody: jsonReq("UserModerationRequestDto"),
  responses: { 200: jsonResp("UserModerationRecordDto") }
});
addPath("/moderation/users/{id}/ban", "post", {
  tags: ["moderation-controller"],
  operationId: "banUser",
  parameters: [pathParam("id")],
  requestBody: jsonReq("UserModerationRequestDto"),
  responses: { 200: jsonResp("UserModerationRecordDto") }
});
addPath("/moderation/comments", "get", {
  tags: ["moderation-controller"],
  operationId: "getPendingModerationCases",
  responses: { 200: jsonArrayResp("ModerationCaseDto") }
});

// User
for (const prefix of ["", "/api/v1"]) {
  addPath(`${prefix}/users/me/profile`, "get", {
    tags: ["user-controller"],
    operationId: prefix ? "getProfile_1" : "getProfile",
    responses: { 200: jsonResp("UserProfileResponseDto") }
  });
  addPath(`${prefix}/users/me/profile`, "put", {
    tags: ["user-controller"],
    operationId: prefix ? "updateProfile_1" : "updateProfile",
    requestBody: jsonReq("UpdateUserProfileRequestDto"),
    responses: { 200: jsonResp("UserProfileResponseDto") }
  });
  addPath(`${prefix}/users/me/reading-history`, "get", {
    tags: ["user-controller"],
    operationId: prefix ? "getReadingHistory" : "getReadingHistory_1",
    responses: { 200: jsonArrayResp("UserReadingHistoryJpaEntity") }
  });
  addPath(`${prefix}/users/me/reading-history`, "post", {
    tags: ["user-controller"],
    operationId: prefix ? "recordReadingEvent" : "recordReadingEvent_1",
    requestBody: jsonReq("RecordReadingRequestDto"),
    responses: { 200: jsonResp("UserReadingHistoryJpaEntity") }
  });
}

// Notification
for (const prefix of ["", "/api/v1"]) {
  addPath(`${prefix}/notifications/{id}/read`, "put", {
    tags: ["notification-controller"],
    operationId: prefix ? "markAsRead_1" : "markAsRead",
    parameters: [pathParam("id")],
    responses: { 200: { description: "Marked as read" } }
  });
  addPath(`${prefix}/notifications/send`, "post", {
    tags: ["notification-controller"],
    operationId: prefix ? "sendNotification_1" : "sendNotification",
    requestBody: jsonReq("SendNotificationRequestDto"),
    responses: { 200: jsonResp("NotificationResponseDto") }
  });
  addPath(`${prefix}/notifications/unread`, "get", {
    tags: ["notification-controller"],
    operationId: prefix ? "getUnreadNotifications_1" : "getUnreadNotifications",
    responses: { 200: jsonArrayResp("NotificationResponseDto") }
  });
  addPath(`${prefix}/notifications`, "get", {
    tags: ["notification-controller"],
    operationId: prefix ? "getUserNotifications_1" : "getUserNotifications",
    responses: { 200: jsonArrayResp("NotificationResponseDto") }
  });
}

// Wire Items Newsroom
const wirePrefixes = ["/api/v1/newsroom", "/newsroom"];
for (let i = 0; i < wirePrefixes.length; i++) {
  const p = wirePrefixes[i];
  const sfx = i === 1 ? "_1" : "";
  addPath(`${p}/wire-items/{id}/state`, "put", {
    tags: ["wire-item-newsroom-controller"],
    operationId: `updateState${sfx}`,
    parameters: [pathParam("id")],
    requestBody: jsonReq("UpdateStatusRequest"),
    responses: { 200: jsonResp("WireItemDto") }
  });
  addPath(`${p}/wire-items/{id}/star`, "put", {
    tags: ["wire-item-newsroom-controller"],
    operationId: `toggleStar${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("WireItemDto") }
  });
  addPath(`${p}/wire-items/{id}/read`, "put", {
    tags: ["wire-item-newsroom-controller"],
    operationId: `toggleRead${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("WireItemDto") }
  });
  addPath(`${p}/wire-items/{id}/unpublish`, "post", {
    tags: ["wire-item-newsroom-controller"],
    operationId: `unpublishFromPublicWeb${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("WireItemDto") }
  });
  addPath(`${p}/wire-items/{id}/publish-direct`, "post", {
    tags: ["wire-item-newsroom-controller"],
    operationId: `publishDirect${sfx}`,
    parameters: [pathParam("id")],
    requestBody: jsonReq("DirectPublishRequestDto", false),
    responses: { 200: jsonResp("DirectPublishResponseDto") }
  });
  addPath(`${p}/wire-items/{id}/publish`, "post", {
    tags: ["wire-item-newsroom-controller"],
    operationId: `publishToPublicWeb${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("WireItemDto") }
  });
  addPath(`${p}/wire-items/{id}/convert-to-story`, "post", {
    tags: ["wire-item-newsroom-controller"],
    operationId: `convertToStory${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("ArticleResponse") }
  });
  addPath(`${p}/wire-items/mark-all-read`, "post", {
    tags: ["wire-item-newsroom-controller"],
    operationId: `markAllRead${sfx}`,
    responses: { 200: { description: "All marked as read" } }
  });
  addPath(`${p}/wire-items/{id}/publication-details`, "get", {
    tags: ["wire-item-newsroom-controller"],
    operationId: `getPublicationDetails${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("WireItemDto") }
  });
  addPath(`${p}/wire-items/stats`, "get", {
    tags: ["wire-item-newsroom-controller"],
    operationId: `getReaderStats${sfx}`,
    responses: { 200: jsonResp("ReaderStatsDto") }
  });
  addPath(`${p}/wire-items/reader`, "get", {
    tags: ["wire-item-newsroom-controller"],
    operationId: `getReaderItems${sfx}`,
    responses: { 200: jsonResp("PageWireItemDto") }
  });
  addPath(`${p}/wire-items/publication-config`, "get", {
    tags: ["wire-item-newsroom-controller"],
    operationId: `getPublicationConfig${sfx}`,
    responses: { 200: jsonResp("PublicationConfigDto") }
  });
  addPath(`${p}/wire-items`, "get", {
    tags: ["wire-item-newsroom-controller"],
    operationId: `getWireItems${sfx}`,
    responses: { 200: jsonResp("PageWireItemDto") }
  });
}

// Live Blog Controller
const lbPrefixes = ["/api/v1/liveblogs", "/live-blogs", "/liveblogs", "/api/v1/live-blogs"];
lbPrefixes.forEach((p, idx) => {
  const sfx = idx === 0 ? "" : `_${idx}`;
  addPath(`${p}/{id}/status`, "put", {
    tags: ["live-blog-controller"],
    operationId: `updateStatus${sfx}`,
    parameters: [pathParam("id")],
    requestBody: jsonReq("UpdateLiveBlogStatusRequestDto"),
    responses: { 200: jsonResp("LiveBlogResponseDto") }
  });
  addPath(`${p}/{id}/entries`, "get", {
    tags: ["live-blog-controller"],
    operationId: `getTimeline${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonArrayResp("LiveBlogEntryResponseDto") }
  });
  addPath(`${p}/{id}/entries`, "post", {
    tags: ["live-blog-controller"],
    operationId: `addEntry${sfx}`,
    parameters: [pathParam("id")],
    requestBody: jsonReq("AddLiveBlogEntryRequestDto"),
    responses: { 200: jsonResp("LiveBlogEntryResponseDto") }
  });
  addPath(`${p}`, "get", {
    tags: ["live-blog-controller"],
    operationId: `getAllLiveBlogs${sfx}`,
    responses: { 200: jsonArrayResp("LiveBlogResponseDto") }
  });
  addPath(`${p}`, "post", {
    tags: ["live-blog-controller"],
    operationId: `createLiveBlog${sfx}`,
    requestBody: jsonReq("CreateLiveBlogRequestDto"),
    responses: { 200: jsonResp("LiveBlogResponseDto") }
  });
  addPath(`${p}/{id}/key-events`, "get", {
    tags: ["live-blog-controller"],
    operationId: `getKeyEvents${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonArrayResp("LiveBlogEntryResponseDto") }
  });
  addPath(`${p}/{id}`, "get", {
    tags: ["live-blog-controller"],
    operationId: `getLiveBlog${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("LiveBlogResponseDto") }
  });
  addPath(`${p}/active`, "get", {
    tags: ["live-blog-controller"],
    operationId: `getActiveLiveBlogs${sfx}`,
    responses: { 200: jsonArrayResp("LiveBlogResponseDto") }
  });
});

// Editorial Governance
addPath("/api/v1/editorial/governance/right-of-response/{caseId}", "put", {
  tags: ["editorial-governance-controller"],
  operationId: "updateRightOfResponseStatus",
  parameters: [pathParam("caseId")],
  requestBody: jsonReq("UpdateRightOfResponseRequest"),
  responses: { 200: jsonResp("RightOfResponseCaseJpaEntity") }
});
addPath("/api/v1/editorial/governance/right-of-response", "post", {
  tags: ["editorial-governance-controller"],
  operationId: "createRightOfResponseCase",
  requestBody: jsonReq("CreateRightOfResponseRequest"),
  responses: { 200: jsonResp("RightOfResponseCaseJpaEntity") }
});
addPath("/api/v1/editorial/governance/distribution/dispatch/{articleId}", "post", {
  tags: ["editorial-governance-controller"],
  operationId: "dispatchDistribution",
  parameters: [pathParam("articleId")],
  responses: { 200: jsonResp("DistributionJobJpaEntity") }
});
addPath("/api/v1/editorial/governance/corrections", "post", {
  tags: ["editorial-governance-controller"],
  operationId: "issuePublicCorrection",
  requestBody: jsonReq("IssuePublicCorrectionRequest"),
  responses: { 200: jsonResp("PublicCorrectionJpaEntity") }
});
addPath("/api/v1/editorial/governance/content-rights", "post", {
  tags: ["editorial-governance-controller"],
  operationId: "registerContentRights",
  requestBody: jsonReq("RegisterContentRightsRequest"),
  responses: { 200: jsonResp("ContentRightsLicenseJpaEntity") }
});
addPath("/api/v1/editorial/governance/ai-provenance", "post", {
  tags: ["editorial-governance-controller"],
  operationId: "logAiProvenance",
  requestBody: jsonReq("LogAiProvenanceRequest"),
  responses: { 200: jsonResp("AiProvenanceJpaEntity") }
});
addPath("/api/v1/editorial/governance/right-of-response/article/{articleId}", "get", {
  tags: ["editorial-governance-controller"],
  operationId: "getRightOfResponseCases",
  parameters: [pathParam("articleId")],
  responses: { 200: jsonArrayResp("RightOfResponseCaseJpaEntity") }
});
addPath("/api/v1/editorial/governance/distribution/article/{articleId}", "get", {
  tags: ["editorial-governance-controller"],
  operationId: "getDistributionJobs",
  parameters: [pathParam("articleId")],
  responses: { 200: jsonArrayResp("DistributionJobJpaEntity") }
});
addPath("/api/v1/editorial/governance/corrections/article/{articleId}", "get", {
  tags: ["editorial-governance-controller"],
  operationId: "getPublicCorrections",
  parameters: [pathParam("articleId")],
  responses: { 200: jsonArrayResp("PublicCorrectionJpaEntity") }
});
addPath("/api/v1/editorial/governance/content-rights/article/{articleId}", "get", {
  tags: ["editorial-governance-controller"],
  operationId: "getContentRights",
  parameters: [pathParam("articleId")],
  responses: { 200: jsonArrayResp("ContentRightsLicenseJpaEntity") }
});
addPath("/api/v1/editorial/governance/ai-provenance/article/{articleId}", "get", {
  tags: ["editorial-governance-controller"],
  operationId: "getAiProvenanceForArticle",
  parameters: [pathParam("articleId")],
  responses: { 200: jsonArrayResp("AiProvenanceJpaEntity") }
});

// Comment Controller
for (const p of ["/api/v1/comments", "/comments"]) {
  const sfx = p === "/comments" ? "_1" : "";
  addPath(`${p}/{id}`, "get", {
    tags: ["comment-controller"],
    operationId: `getComment${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("CommentDto") }
  });
  addPath(`${p}/{id}`, "put", {
    tags: ["comment-controller"],
    operationId: `updateComment${sfx}`,
    parameters: [pathParam("id")],
    requestBody: jsonReq("UpdateCommentRequestDto"),
    responses: { 200: jsonResp("CommentDto") }
  });
  addPath(`${p}/{id}`, "delete", {
    tags: ["comment-controller"],
    operationId: `deleteComment${sfx || "_1"}`,
    parameters: [pathParam("id")],
    responses: { 200: { description: "Comment deleted" } }
  });
  addPath(`${p}/{id}/report`, "post", {
    tags: ["comment-controller"],
    operationId: `reportComment${sfx}`,
    parameters: [pathParam("id")],
    requestBody: jsonReq("ReportCommentRequestDto"),
    responses: { 200: jsonResp("CommentReportDto") }
  });
  addPath(`${p}/{id}/reply`, "post", {
    tags: ["comment-controller"],
    operationId: `createReply${sfx}`,
    parameters: [pathParam("id")],
    requestBody: jsonReq("CreateReplyRequestDto"),
    responses: { 200: jsonResp("CommentDto") }
  });
  addPath(`${p}/{id}/like`, "post", {
    tags: ["comment-controller"],
    operationId: `likeComment${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: { description: "Comment liked" } }
  });
  addPath(`${p}/{id}/like`, "delete", {
    tags: ["comment-controller"],
    operationId: `unlikeComment${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: { description: "Comment unliked" } }
  });
}

// Articles & Article comments
addPath("/api/v1/articles/{id}/comments", "get", {
  tags: ["comment-controller"],
  operationId: "getArticleComments",
  parameters: [pathParam("id")],
  responses: { 200: jsonArrayResp("CommentDto") }
});
addPath("/api/v1/articles/{id}/comments", "post", {
  tags: ["comment-controller"],
  operationId: "createComment",
  parameters: [pathParam("id")],
  requestBody: jsonReq("CreateCommentRequestDto"),
  responses: { 200: jsonResp("CommentDto") }
});
addPath("/articles/{id}/comments", "get", {
  tags: ["comment-controller"],
  operationId: "getArticleComments_2",
  parameters: [pathParam("id")],
  responses: { 200: jsonArrayResp("CommentDto") }
});
addPath("/articles/{id}/comments", "post", {
  tags: ["comment-controller"],
  operationId: "createComment_2",
  parameters: [pathParam("id")],
  requestBody: jsonReq("CreateCommentRequestDto"),
  responses: { 200: jsonResp("CommentDto") }
});

// Taxonomy
for (const p of ["/api/v1/cms", "/cms"]) {
  const sfx = p === "/cms" ? "_1" : "";
  addPath(`${p}/desks/{id}`, "put", {
    tags: ["cms-taxonomy-controller"],
    operationId: `updateDesk${sfx}`,
    parameters: [pathParam("id")],
    requestBody: jsonReq("CreateDeskRequestDto"),
    responses: { 200: jsonResp("NewsroomDeskJpaEntity") }
  });
  addPath(`${p}/desks/{id}`, "delete", {
    tags: ["cms-taxonomy-controller"],
    operationId: `deleteDesk${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: { description: "Desk deleted" } }
  });
  addPath(`${p}/categories/{id}`, "get", {
    tags: ["cms-taxonomy-controller"],
    operationId: `getCategoryById${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("Category") }
  });
  addPath(`${p}/categories/{id}`, "put", {
    tags: ["cms-taxonomy-controller"],
    operationId: `updateCategory${sfx}`,
    parameters: [pathParam("id")],
    requestBody: jsonReq("CreateCategoryRequestDto"),
    responses: { 200: jsonResp("Category") }
  });
  addPath(`${p}/categories/{id}`, "delete", {
    tags: ["cms-taxonomy-controller"],
    operationId: `deleteCategory${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: { description: "Category deleted" } }
  });
  addPath(`${p}/tags`, "get", {
    tags: ["cms-taxonomy-controller"],
    operationId: `listTags${sfx}`,
    responses: { 200: jsonArrayResp("Tag") }
  });
  addPath(`${p}/tags`, "post", {
    tags: ["cms-taxonomy-controller"],
    operationId: `createTag${sfx}`,
    requestBody: jsonReq("CreateTagRequestDto"),
    responses: { 200: jsonResp("Tag") }
  });
  addPath(`${p}/desks`, "get", {
    tags: ["cms-taxonomy-controller"],
    operationId: `listDesks${sfx}`,
    responses: { 200: jsonArrayResp("NewsroomDeskJpaEntity") }
  });
  addPath(`${p}/desks`, "post", {
    tags: ["cms-taxonomy-controller"],
    operationId: `createDesk${sfx}`,
    requestBody: jsonReq("CreateDeskRequestDto"),
    responses: { 200: jsonResp("NewsroomDeskJpaEntity") }
  });
  addPath(`${p}/collections`, "get", {
    tags: ["cms-taxonomy-controller"],
    operationId: `listCollections${sfx}`,
    responses: { 200: jsonArrayResp("Collection") }
  });
  addPath(`${p}/collections`, "post", {
    tags: ["cms-taxonomy-controller"],
    operationId: `createCollection${sfx}`,
    requestBody: jsonReq("CreateCollectionRequestDto"),
    responses: { 200: jsonResp("Collection") }
  });
  addPath(`${p}/categories`, "get", {
    tags: ["cms-taxonomy-controller"],
    operationId: `listCategories${sfx}`,
    responses: { 200: jsonArrayResp("Category") }
  });
  addPath(`${p}/categories`, "post", {
    tags: ["cms-taxonomy-controller"],
    operationId: `createCategory${sfx}`,
    requestBody: jsonReq("CreateCategoryRequestDto"),
    responses: { 200: jsonResp("Category") }
  });
  addPath(`${p}/collections/{slug}`, "get", {
    tags: ["cms-taxonomy-controller"],
    operationId: `getCollectionBySlug${sfx}`,
    parameters: [pathParam("slug")],
    responses: { 200: jsonResp("Collection") }
  });
}

// Article Controller
for (const p of ["/articles", "/api/v1/articles"]) {
  const sfx = p === "/api/v1/articles" ? "_1" : "";
  addPath(`${p}/{id}`, "put", {
    tags: ["article-controller"],
    operationId: `updateArticle${sfx}`,
    parameters: [pathParam("id")],
    requestBody: jsonReq("UpdateArticleRequest"),
    responses: { 200: jsonResp("ArticleResponse") }
  });
  addPath(`${p}/{id}`, "delete", {
    tags: ["article-controller"],
    operationId: `deleteArticle${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: { description: "Article deleted" } }
  });
  addPath(`${p}/{id}/status`, "post", {
    tags: ["article-controller"],
    operationId: `transitionStatus${sfx}`,
    parameters: [pathParam("id")],
    requestBody: jsonReq("UpdateStatusRequest"),
    responses: { 200: jsonResp("ArticleResponse") }
  });
  addPath(`${p}`, "get", {
    tags: ["article-controller"],
    operationId: `listArticles${sfx}`,
    responses: { 200: jsonArrayResp("ArticleResponse") }
  });
  addPath(`${p}`, "post", {
    tags: ["article-controller"],
    operationId: `createArticle${sfx}`,
    requestBody: jsonReq("CreateArticleRequest"),
    responses: { 200: jsonResp("ArticleResponse") }
  });
  addPath(`${p}/{slugOrId}`, "get", {
    tags: ["article-controller"],
    operationId: `getArticleBySlugOrId${sfx}`,
    parameters: [pathParam("slugOrId")],
    responses: { 200: jsonResp("ArticleResponse") }
  });
  addPath(`${p}/stats`, "get", {
    tags: ["article-controller"],
    operationId: `getArticleStats${sfx}`,
    responses: { 200: jsonResp("ArticleAnalyticsDto") }
  });
  addPath(`${p}/slug/{slug}`, "get", {
    tags: ["article-controller"],
    operationId: `getArticleBySlug${sfx ? "_5" : "_4"}`,
    parameters: [pathParam("slug")],
    responses: { 200: jsonResp("ArticleResponse") }
  });
}

// Provider Admin
for (const p of ["/api/v1/admin/providers", "/admin/providers"]) {
  const sfx = p === "/admin/providers" ? "_1" : "";
  addPath(`${p}/{key}`, "get", {
    tags: ["provider-admin-controller"],
    operationId: `getProviderByKey${sfx}`,
    parameters: [pathParam("key")],
    responses: { 200: jsonResp("ProviderConfigResponseDto") }
  });
  addPath(`${p}/{key}`, "put", {
    tags: ["provider-admin-controller"],
    operationId: `updateProviderConfig${sfx}`,
    parameters: [pathParam("key")],
    requestBody: jsonReq("UpdateProviderConfigRequestDto"),
    responses: { 200: jsonResp("ProviderConfigResponseDto") }
  });
  addPath(`${p}/{key}/ingest`, "post", {
    tags: ["provider-admin-controller"],
    operationId: `triggerIngestionForProvider${sfx}`,
    parameters: [pathParam("key")],
    responses: { 200: jsonResp("TestFetchResponseDto") }
  });
  addPath(`${p}/{key}/credentials`, "post", {
    tags: ["provider-admin-controller"],
    operationId: `registerCredential${sfx}`,
    parameters: [pathParam("key")],
    requestBody: jsonReq("RegisterCredentialRequestDto"),
    responses: { 200: { description: "Credentials registered" } }
  });
  addPath(`${p}/ingest-all`, "post", {
    tags: ["provider-admin-controller"],
    operationId: `triggerIngestionAll${sfx}`,
    responses: { 200: jsonResp("TestFetchResponseDto") }
  });
  addPath(`${p}`, "get", {
    tags: ["provider-admin-controller"],
    operationId: `getAllProviders${sfx}`,
    responses: { 200: jsonArrayResp("ProviderConfigResponseDto") }
  });
}

// Advertisement Controller
addPath("/ads/campaigns/{id}", "put", {
  tags: ["advertisement-controller"],
  operationId: "updateCampaign",
  parameters: [pathParam("id")],
  requestBody: jsonReq("UpdateCampaignRequestDto"),
  responses: { 200: jsonResp("CampaignDto") }
});
addPath("/ads/campaigns/{id}", "delete", {
  tags: ["advertisement-controller"],
  operationId: "deleteCampaign",
  parameters: [pathParam("id")],
  responses: { 200: { description: "Campaign deleted" } }
});
addPath("/ads", "post", {
  tags: ["advertisement-controller"],
  operationId: "createAdvertisement",
  requestBody: jsonReq("CreateAdRequestDto"),
  responses: { 200: jsonResp("AdvertisementDto") }
});
addPath("/ads/{id}/impression", "post", {
  tags: ["advertisement-controller"],
  operationId: "recordImpression",
  parameters: [pathParam("id")],
  responses: { 200: { description: "Impression recorded" } }
});
addPath("/ads/{id}/click", "post", {
  tags: ["advertisement-controller"],
  operationId: "recordClick",
  parameters: [pathParam("id")],
  responses: { 200: { description: "Click recorded" } }
});
addPath("/ads/campaigns", "get", {
  tags: ["advertisement-controller"],
  operationId: "getAllCampaigns",
  responses: { 200: jsonArrayResp("CampaignDto") }
});
addPath("/ads/campaigns", "post", {
  tags: ["advertisement-controller"],
  operationId: "createCampaign",
  requestBody: jsonReq("CreateCampaignRequestDto"),
  responses: { 200: jsonResp("CampaignDto") }
});
addPath("/ads/{placement}", "get", {
  tags: ["advertisement-controller"],
  operationId: "serveAd",
  parameters: [pathParam("placement")],
  responses: { 200: jsonResp("ServeAdResponseDto") }
});

// CMS Schedule
addPath("/cms/schedules", "post", {
  tags: ["cms-schedule-controller"],
  operationId: "scheduleArticlePublish",
  requestBody: jsonReq("SchedulePublishRequestDto"),
  responses: { 200: jsonResp("PublishingSchedule") }
});
addPath("/cms/schedules/process", "post", {
  tags: ["cms-schedule-controller"],
  operationId: "processSchedules",
  responses: { 200: jsonResp("ScheduleProcessResponseDto") }
});
addPath("/cms/schedules/pending", "get", {
  tags: ["cms-schedule-controller"],
  operationId: "listPendingSchedules",
  responses: { 200: jsonArrayResp("PublishingSchedule") }
});

// Platform Users
for (const p of ["/users", "/api/v1/users"]) {
  const sfx = p === "/api/v1/users" ? "_1" : "";
  addPath(`${p}`, "get", {
    tags: ["platform-users-controller"],
    operationId: `listUsers${sfx}`,
    responses: { 200: jsonArrayResp("CurrentUserDto") }
  });
  addPath(`${p}`, "post", {
    tags: ["platform-users-controller"],
    operationId: `createUser${sfx}`,
    requestBody: jsonReq("CreateUserRequest"),
    responses: { 200: jsonResp("CurrentUserDto") }
  });
  addPath(`${p}/me`, "get", {
    tags: ["platform-users-controller"],
    operationId: `getCurrentUser${sfx}`,
    responses: { 200: jsonResp("CurrentUserDto") }
  });
}

// Search
for (const p of ["/api/v1/search", "/search"]) {
  const sfx = p === "/search" ? "_1" : "";
  addPath(`${p}/reindex`, "post", {
    tags: ["search-controller"],
    operationId: `reindex${sfx}`,
    responses: { 200: jsonResp("ReindexResponseDto") }
  });
  addPath(`${p}/index`, "post", {
    tags: ["search-controller"],
    operationId: `indexDocument${sfx}`,
    requestBody: jsonReq("IndexDocumentRequestDto"),
    responses: { 200: jsonResp("SearchDocument") }
  });
  addPath(`${p}/suggest`, "get", {
    tags: ["search-controller"],
    operationId: `suggest${sfx}`,
    parameters: [queryParam("q", "string", true)],
    responses: { 200: { description: "Suggestions", content: { "application/json": { schema: { type: "array", items: { type: "string" } } } } } }
  });
  addPath(`${p}/article/{id}`, "get", {
    tags: ["search-controller"],
    operationId: `getIndexedArticle${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("SearchDocument") }
  });
  addPath(`${p}`, "get", {
    tags: ["search-controller"],
    operationId: `search${sfx}`,
    parameters: [queryParam("q", "string", true)],
    responses: { 200: jsonResp("SearchResultPage") }
  });
}

// Saved Articles / Bookmarks
const bmPrefixes = ["/saved-articles", "/bookmarks", "/api/v1/saved-articles", "/api/v1/bookmarks"];
bmPrefixes.forEach((p, idx) => {
  const sfx = idx === 0 ? "" : `_${idx}`;
  addPath(`${p}/{articleId}`, "post", {
    tags: ["saved-article-controller"],
    operationId: `saveArticleByPath${sfx}`,
    parameters: [pathParam("articleId")],
    responses: { 200: jsonResp("SavedArticleJpaEntity") }
  });
  addPath(`${p}/{articleId}`, "delete", {
    tags: ["saved-article-controller"],
    operationId: `unsaveArticle${sfx}`,
    parameters: [pathParam("articleId")],
    responses: { 200: { description: "Article unsaved" } }
  });
  addPath(`${p}`, "get", {
    tags: ["saved-article-controller"],
    operationId: `getSavedArticles${sfx}`,
    responses: { 200: jsonArrayResp("SavedArticleJpaEntity") }
  });
  addPath(`${p}`, "post", {
    tags: ["saved-article-controller"],
    operationId: `saveArticle${sfx}`,
    requestBody: jsonReq("SaveArticleRequestDto"),
    responses: { 200: jsonResp("SavedArticleJpaEntity") }
  });
  addPath(`${p}/check/{articleId}`, "get", {
    tags: ["saved-article-controller"],
    operationId: `checkSavedStatus${sfx}`,
    parameters: [pathParam("articleId")],
    responses: { 200: jsonResp("BookmarkStatusDto") }
  });
});

// News Feed Controller
const feedPrefixes = ["/news/feed", "/api/v1/feed", "/api/v1/news/feed", "/feed"];
feedPrefixes.forEach((p, idx) => {
  const sfx = idx === 0 ? "" : `_${idx}`;
  addPath(`${p}/breaking`, "get", {
    tags: ["news-feed-controller"],
    operationId: `getActiveBreakingNews${sfx}`,
    responses: { 200: jsonArrayResp("BreakingNewsTickerResponseDto") }
  });
  addPath(`${p}/breaking`, "post", {
    tags: ["news-feed-controller"],
    operationId: `createBreakingNews${sfx}`,
    requestBody: jsonReq("CreateBreakingNewsRequestDto"),
    responses: { 200: jsonResp("BreakingNewsTickerResponseDto") }
  });
  addPath(`${p}/videos`, "get", {
    tags: ["news-feed-controller"],
    operationId: `getVideos${sfx}`,
    responses: { 200: jsonArrayResp("NewsFeedDto") }
  });
  addPath(`${p}/trending`, "get", {
    tags: ["news-feed-controller"],
    operationId: `getTrendingFeed${sfx}`,
    responses: { 200: jsonArrayResp("NewsFeedDto") }
  });
  addPath(`${p}/topics/{topic}`, "get", {
    tags: ["news-feed-controller"],
    operationId: `getFeedByTopic${sfx}`,
    parameters: [pathParam("topic")],
    responses: { 200: jsonArrayResp("NewsFeedDto") }
  });
  addPath(`${p}/topics`, "get", {
    tags: ["news-feed-controller"],
    operationId: `getDistinctTopics${sfx}`,
    responses: { 200: { description: "Topics", content: { "application/json": { schema: { type: "array", items: { type: "string" } } } } } }
  });
  addPath(`${p}/slug/{slug}`, "get", {
    tags: ["news-feed-controller"],
    operationId: `getArticleBySlugFeed${sfx}`,
    parameters: [pathParam("slug")],
    responses: { 200: jsonResp("ArticleResponse") }
  });
  addPath(`${p}/recommendations`, "get", {
    tags: ["news-feed-controller"],
    operationId: `getRecommendations${sfx}`,
    responses: { 200: jsonArrayResp("NewsFeedDto") }
  });
  addPath(`${p}/podcasts`, "get", {
    tags: ["news-feed-controller"],
    operationId: `getPodcasts${sfx}`,
    responses: { 200: jsonArrayResp("NewsFeedDto") }
  });
  addPath(`${p}/opinions`, "get", {
    tags: ["news-feed-controller"],
    operationId: `getOpinions${sfx}`,
    responses: { 200: jsonArrayResp("NewsFeedDto") }
  });
  addPath(`${p}/latest`, "get", {
    tags: ["news-feed-controller"],
    operationId: `getPublicFeedLatest${sfx}`,
    responses: { 200: jsonArrayResp("NewsFeedDto") }
  });
  addPath(`${p}/public`, "get", {
    tags: ["news-feed-controller"],
    operationId: `getPublicFeedPublic${sfx}`,
    responses: { 200: jsonArrayResp("NewsFeedDto") }
  });
  addPath(`${p}`, "get", {
    tags: ["news-feed-controller"],
    operationId: `getPublicFeedRoot${sfx}`,
    responses: { 200: jsonArrayResp("NewsFeedDto") }
  });
  addPath(`${p}/investigations`, "get", {
    tags: ["news-feed-controller"],
    operationId: `getInvestigations${sfx}`,
    responses: { 200: jsonArrayResp("NewsFeedDto") }
  });
  addPath(`${p}/editors-picks`, "get", {
    tags: ["news-feed-controller"],
    operationId: `getEditorsPicks${sfx}`,
    responses: { 200: jsonArrayResp("NewsFeedDto") }
  });
  addPath(`${p}/category/{category}`, "get", {
    tags: ["news-feed-controller"],
    operationId: `getFeedByCategory${sfx}`,
    parameters: [pathParam("category")],
    responses: { 200: jsonArrayResp("NewsFeedDto") }
  });
});

// Media Controller
for (const p of ["/media", "/api/v1/media"]) {
  const sfx = p === "/api/v1/media" ? "_1" : "";
  addPath(`${p}`, "get", {
    tags: ["media-controller"],
    operationId: `listMedia${sfx}`,
    responses: { 200: jsonArrayResp("MediaAssetJpaEntity") }
  });
  addPath(`${p}`, "post", {
    tags: ["media-controller"],
    operationId: `createMedia${sfx}`,
    requestBody: jsonReq("CreateMediaRequest"),
    responses: { 200: jsonResp("MediaAssetJpaEntity") }
  });
  addPath(`${p}/{id}`, "get", {
    tags: ["media-controller"],
    operationId: `getMediaById${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("MediaAssetJpaEntity") }
  });
  addPath(`${p}/{id}`, "delete", {
    tags: ["media-controller"],
    operationId: `deleteMedia${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: { description: "Media deleted" } }
  });
}

// Taxonomy Extension
addPath("/api/v1/cms/taxonomy/geography", "post", {
  tags: ["taxonomy-extension-controller"],
  operationId: "createGeographyNode",
  requestBody: jsonReq("CreateGeographyRequest"),
  responses: { 200: jsonResp("GeographyNodeJpaEntity") }
});
addPath("/api/v1/cms/taxonomy/entities", "post", {
  tags: ["taxonomy-extension-controller"],
  operationId: "createDomainEntity",
  requestBody: jsonReq("CreateEntityRequest"),
  responses: { 200: jsonResp("DomainEntityJpaEntity") }
});
addPath("/api/v1/cms/taxonomy/entities/articles/{articleId}", "get", {
  tags: ["taxonomy-extension-controller"],
  operationId: "getEntitiesForArticle",
  parameters: [pathParam("articleId")],
  responses: { 200: jsonArrayResp("DomainEntityJpaEntity") }
});
addPath("/api/v1/cms/taxonomy/entities/articles/{articleId}", "post", {
  tags: ["taxonomy-extension-controller"],
  operationId: "associateEntityWithArticle",
  parameters: [pathParam("articleId")],
  requestBody: jsonReq("AssociateEntityRequest"),
  responses: { 200: jsonResp("ArticleEntityMappingJpaEntity") }
});
addPath("/api/v1/cms/taxonomy/beats", "post", {
  tags: ["taxonomy-extension-controller"],
  operationId: "createBeat",
  requestBody: jsonReq("CreateBeatRequest"),
  responses: { 200: jsonResp("NewsroomBeatJpaEntity") }
});
addPath("/api/v1/cms/taxonomy/geography/{slug}", "get", {
  tags: ["taxonomy-extension-controller"],
  operationId: "getGeographyNode",
  parameters: [pathParam("slug")],
  responses: { 200: jsonResp("GeographyNodeJpaEntity") }
});
addPath("/api/v1/cms/taxonomy/geography/parent/{parentId}", "get", {
  tags: ["taxonomy-extension-controller"],
  operationId: "getGeographyChildren",
  parameters: [pathParam("parentId")],
  responses: { 200: jsonArrayResp("GeographyNodeJpaEntity") }
});
addPath("/api/v1/cms/taxonomy/beats/desk/{deskId}", "get", {
  tags: ["taxonomy-extension-controller"],
  operationId: "getBeatsByDesk",
  parameters: [pathParam("deskId")],
  responses: { 200: jsonArrayResp("NewsroomBeatJpaEntity") }
});

// CMS Homepage
for (const p of ["/cms/homepages", "/api/v1/cms/homepages"]) {
  const sfx = p === "/api/v1/cms/homepages" ? "_1" : "";
  addPath(`${p}/slots`, "post", {
    tags: ["cms-homepage-controller"],
    operationId: `assignSlot${sfx}`,
    requestBody: jsonReq("AssignSlotRequestDto"),
    responses: { 200: jsonResp("HomepageSlot") }
  });
  addPath(`${p}/sections`, "post", {
    tags: ["cms-homepage-controller"],
    operationId: `addSection${sfx}`,
    requestBody: jsonReq("CreateSectionRequestDto"),
    responses: { 200: jsonResp("Section") }
  });
  addPath(`${p}`, "post", {
    tags: ["cms-homepage-controller"],
    operationId: `createHomepage${sfx}`,
    requestBody: jsonReq("CreateHomepageRequestDto"),
    responses: { 200: jsonResp("Homepage") }
  });
  addPath(`${p}/{homepageId}/sections`, "get", {
    tags: ["cms-homepage-controller"],
    operationId: `getSections${sfx}`,
    parameters: [pathParam("homepageId")],
    responses: { 200: jsonArrayResp("Section") }
  });
  addPath(`${p}/sections/{sectionId}/slots`, "get", {
    tags: ["cms-homepage-controller"],
    operationId: `getSlots${sfx}`,
    parameters: [pathParam("sectionId")],
    responses: { 200: jsonArrayResp("HomepageSlot") }
  });
  addPath(`${p}/edition/{editionId}`, "get", {
    tags: ["cms-homepage-controller"],
    operationId: `getHomepageByEdition${sfx}`,
    parameters: [pathParam("editionId")],
    responses: { 200: jsonResp("Homepage") }
  });
}

// CMS Edition
for (const p of ["/api/v1/cms/editions", "/cms/editions"]) {
  const sfx = p === "/cms/editions" ? "_1" : "";
  addPath(`${p}/{id}/schedule`, "post", {
    tags: ["cms-edition-controller"],
    operationId: `scheduleEdition${sfx}`,
    parameters: [pathParam("id")],
    requestBody: jsonReq("ScheduleEditionRequestDto"),
    responses: { 200: jsonResp("Edition") }
  });
  addPath(`${p}/{id}/publish`, "post", {
    tags: ["cms-edition-controller"],
    operationId: `publishEdition${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("Edition") }
  });
  addPath(`${p}`, "get", {
    tags: ["cms-edition-controller"],
    operationId: `listEditions${sfx}`,
    responses: { 200: jsonArrayResp("Edition") }
  });
  addPath(`${p}`, "post", {
    tags: ["cms-edition-controller"],
    operationId: `createEdition${sfx}`,
    requestBody: jsonReq("CreateEditionRequestDto"),
    responses: { 200: jsonResp("Edition") }
  });
  addPath(`${p}/{id}`, "get", {
    tags: ["cms-edition-controller"],
    operationId: `getEdition${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("Edition") }
  });
}

// RBAC Management
for (const p of ["/api/v1/admin", "/admin"]) {
  const sfx = p === "/admin" ? "" : "_1";
  addPath(`${p}/roles/{id}/clone`, "post", {
    tags: ["rbac-management-controller"],
    operationId: `cloneRole${sfx}`,
    parameters: [pathParam("id")],
    requestBody: jsonReq("CloneRoleRequest"),
    responses: { 200: jsonResp("RoleDto") }
  });
  addPath(`${p}/roles`, "get", {
    tags: ["rbac-management-controller"],
    operationId: `getAllRoles${sfx}`,
    responses: { 200: jsonArrayResp("RoleDto") }
  });
  addPath(`${p}/roles`, "post", {
    tags: ["rbac-management-controller"],
    operationId: `createRole${sfx}`,
    requestBody: jsonReq("CreateRoleRequest"),
    responses: { 200: jsonResp("RoleDto") }
  });
  addPath(`${p}/authorization/simulate`, "post", {
    tags: ["rbac-management-controller"],
    operationId: `simulateAuthorization${sfx}`,
    requestBody: jsonReq("SimulateRequest"),
    responses: { 200: jsonResp("AuthorizationSimulationResult") }
  });
  addPath(`${p}/users/{userId}/effective-permissions`, "get", {
    tags: ["rbac-management-controller"],
    operationId: `getEffectivePermissions${sfx}`,
    parameters: [pathParam("userId")],
    responses: { 200: { description: "Permissions", content: { "application/json": { schema: { type: "array", items: { type: "string" } } } } } }
  });
  addPath(`${p}/permissions`, "get", {
    tags: ["rbac-management-controller"],
    operationId: `getPermissionRegistry${sfx}`,
    responses: { 200: { description: "Permission registry", content: { "application/json": { schema: { type: "array", items: { type: "string" } } } } } }
  });
}

// Publication Controller
for (const p of ["/admin/publishing/jobs", "/api/v1/admin/publishing/jobs"]) {
  const sfx = p === "/api/v1/admin/publishing/jobs" ? "_1" : "";
  addPath(`${p}`, "get", {
    tags: ["publication-controller"],
    operationId: `getAllJobs${sfx}`,
    responses: { 200: jsonArrayResp("PublicationJobJpaEntity") }
  });
  addPath(`${p}`, "post", {
    tags: ["publication-controller"],
    operationId: `triggerJob${sfx}`,
    requestBody: jsonReq("TriggerPublicationJobRequest"),
    responses: { 200: jsonResp("PublicationJobJpaEntity") }
  });
  addPath(`${p}/article/{articleId}`, "get", {
    tags: ["publication-controller"],
    operationId: `getJobHistory${sfx}`,
    parameters: [pathParam("articleId")],
    responses: { 200: jsonArrayResp("PublicationJobJpaEntity") }
  });
}
addPath("/sitemap.xml", "get", {
  tags: ["publication-controller"],
  operationId: "getSitemapXml",
  responses: { 200: { description: "XML sitemap", content: { "application/xml": { schema: { type: "string" } } } } }
});
for (const p of ["/public/feeds/rss", "/api/v1/public/feeds/rss"]) {
  addPath(p, "get", {
    tags: ["publication-controller"],
    operationId: p.includes("api/v1") ? "getRss2Feed_1" : "getRss2Feed",
    responses: { 200: { description: "RSS Feed", content: { "application/xml": { schema: { type: "string" } } } } }
  });
}
addPath("/api/v1/public/feeds/json", "get", {
  tags: ["publication-controller"],
  operationId: "getJsonFeed",
  responses: { 200: { description: "JSON Feed", content: { "application/json": { schema: { type: "object" } } } } }
});
for (const p of ["/public/articles/{slug}/corrections", "/api/v1/public/articles/{slug}/corrections"]) {
  addPath(p, "get", {
    tags: ["publication-controller"],
    operationId: p.includes("api/v1") ? "getPublicArticleCorrections_1" : "getPublicArticleCorrections",
    parameters: [pathParam("slug")],
    responses: { 200: jsonArrayResp("PublicCorrectionJpaEntity") }
  });
}
for (const p of ["/api/v1/public/articles/{slug}", "/public/articles/{slug}"]) {
  addPath(p, "get", {
    tags: ["publication-controller"],
    operationId: p.includes("api/v1") ? "getPublicArticleBySlug" : "getPublicArticleBySlug_1",
    parameters: [pathParam("slug")],
    responses: { 200: jsonResp("ArticleResponse") }
  });
}
for (const p of ["/public/articles", "/api/v1/public/articles"]) {
  addPath(p, "get", {
    tags: ["publication-controller"],
    operationId: p.includes("api/v1") ? "getPublicPublishedArticles_1" : "getPublicPublishedArticles",
    responses: { 200: jsonArrayResp("ArticleResponse") }
  });
}

// Location Controller
for (const p of ["/admin/locations", "/api/v1/admin/locations"]) {
  const sfx = p.includes("api/v1") ? "_1" : "";
  addPath(`${p}/postal-codes`, "post", {
    tags: ["location-controller"],
    operationId: `createPostalCodeMapping${sfx}`,
    requestBody: jsonReq("CreatePostalCodeMappingRequest"),
    responses: { 200: jsonResp("LocationPostalCodeJpaEntity") }
  });
  addPath(`${p}/import-jobs`, "post", {
    tags: ["location-controller"],
    operationId: `createImportJob${sfx}`,
    requestBody: jsonReq("ImportLocationDto"),
    responses: { 200: jsonResp("LocationImportJobJpaEntity") }
  });
  addPath(`${p}/import`, "post", {
    tags: ["location-controller"],
    operationId: `importLocations${sfx}`,
    requestBody: jsonReq("ImportLocationDto"),
    responses: { 200: { description: "Locations imported" } }
  });
  addPath(`${p}/import-jobs/{id}`, "get", {
    tags: ["location-controller"],
    operationId: `getImportJobStatus${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("LocationImportJobJpaEntity") }
  });
}
for (const p of ["/locations", "/api/v1/locations"]) {
  const sfx = p.includes("api/v1") ? "_1" : "";
  addPath(`${p}/states/{id}/districts`, "get", {
    tags: ["location-controller"],
    operationId: `getDistricts${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: { description: "Districts list" } }
  });
  addPath(`${p}/search`, "get", {
    tags: ["location-controller"],
    operationId: p.includes("api/v1") ? "search_3" : "search_2",
    parameters: [queryParam("q", "string", true)],
    responses: { 200: { description: "Search locations" } }
  });
  addPath(`${p}/regions/{id}/states`, "get", {
    tags: ["location-controller"],
    operationId: `getStatesByRegion${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: { description: "States list" } }
  });
  addPath(`${p}/postal-codes/{code}`, "get", {
    tags: ["location-controller"],
    operationId: `getByPostalCode${sfx}`,
    parameters: [pathParam("code")],
    responses: { 200: jsonResp("LocationPostalCodeJpaEntity") }
  });
  addPath(`${p}/nearby`, "get", {
    tags: ["location-controller"],
    operationId: `getNearby${sfx}`,
    responses: { 200: { description: "Nearby locations" } }
  });
  addPath(`${p}/districts/{id}/cities`, "get", {
    tags: ["location-controller"],
    operationId: `getCities${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: { description: "Cities list" } }
  });
  addPath(`${p}/countries/{id}/regions`, "get", {
    tags: ["location-controller"],
    operationId: p.includes("api/v1") ? "getRegions" : "getRegions_1",
    parameters: [pathParam("id")],
    responses: { 200: { description: "Regions list" } }
  });
  addPath(`${p}/countries`, "get", {
    tags: ["location-controller"],
    operationId: p.includes("api/v1") ? "getCountries" : "getCountries_1",
    responses: { 200: { description: "Countries list" } }
  });
  addPath(`${p}/cities/{id}/localities`, "get", {
    tags: ["location-controller"],
    operationId: `getLocalities${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: { description: "Localities list" } }
  });
  addPath(`${p}/autocomplete`, "get", {
    tags: ["location-controller"],
    operationId: `autocomplete${sfx}`,
    parameters: [queryParam("q", "string", true)],
    responses: { 200: { description: "Autocomplete list" } }
  });
}
for (const p of ["/geocoding/reverse", "/api/v1/geocoding/reverse"]) {
  addPath(p, "get", {
    tags: ["location-controller"],
    operationId: p.includes("api/v1") ? "reverseGeocode_1" : "reverseGeocode",
    parameters: [queryParam("lat", "number", true), queryParam("lng", "number", true)],
    responses: { 200: jsonResp("ReverseGeocodeResult") }
  });
}
for (const p of ["/api/v1/geocoding", "/geocoding"]) {
  addPath(p, "get", {
    tags: ["location-controller"],
    operationId: p.includes("api/v1") ? "geocode" : "geocode_1",
    parameters: [queryParam("address", "string", true)],
    responses: { 200: jsonResp("GeocodeResult") }
  });
}

// Editorial Intelligence
for (const p of ["/api/v1/admin/intelligence/clusters", "/admin/intelligence/clusters"]) {
  const sfx = p.includes("api/v1") ? "" : "_1";
  addPath(`${p}/{id}/merge`, "post", {
    tags: ["editorial-intelligence-controller"],
    operationId: `mergeClusters${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("StoryClusterJpaEntity") }
  });
  addPath(`${p}/{id}/canonical`, "post", {
    tags: ["editorial-intelligence-controller"],
    operationId: `setCanonicalSource${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("StoryClusterJpaEntity") }
  });
  addPath(`${p}/{id}/breaking`, "post", {
    tags: ["editorial-intelligence-controller"],
    operationId: `toggleBreaking${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("StoryClusterJpaEntity") }
  });
  addPath(`${p}/{id}/brief`, "get", {
    tags: ["editorial-intelligence-controller"],
    operationId: `getJournalistBrief${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("JournalistBriefDto") }
  });
  addPath(`${p}/{id}`, "get", {
    tags: ["editorial-intelligence-controller"],
    operationId: p.includes("api/v1") ? "getClusterDetail_1" : "getClusterDetail",
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("ClusterDetailResponseDto") }
  });
  addPath(`${p}`, "get", {
    tags: ["editorial-intelligence-controller"],
    operationId: `listClusters${sfx}`,
    responses: { 200: jsonResp("PageStoryClusterJpaEntity") }
  });
}

// Candidate Review
const candPrefixes = [
  "/api/v1/admin/intelligence",
  "/api/v1/admin/ingestion",
  "/admin/intelligence",
  "/admin/ingestion"
];
candPrefixes.forEach((p, idx) => {
  const sfx = idx === 0 ? "" : `_${idx}`;
  addPath(`${p}/candidates/{id}/restore`, "post", {
    tags: ["candidate-review-controller"],
    operationId: `restoreCandidate${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("CandidateResponseDto") }
  });
  addPath(`${p}/candidates/{id}/reject`, "post", {
    tags: ["candidate-review-controller"],
    operationId: `rejectCandidate${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("CandidateResponseDto") }
  });
  addPath(`${p}/candidates/{id}/monitor`, "post", {
    tags: ["candidate-review-controller"],
    operationId: `monitorCandidate${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("CandidateResponseDto") }
  });
  addPath(`${p}/candidates/{id}/ignore`, "post", {
    tags: ["candidate-review-controller"],
    operationId: `ignoreCandidate${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("CandidateResponseDto") }
  });
  addPath(`${p}/candidates/{id}/convert`, "post", {
    tags: ["candidate-review-controller"],
    operationId: `convertCandidateToStory${sfx}`,
    parameters: [pathParam("id")],
    requestBody: jsonReq("ConvertCandidateRequestDto"),
    responses: { 200: jsonResp("ArticleResponse") }
  });
  addPath(`${p}/candidates/{id}/assign`, "post", {
    tags: ["candidate-review-controller"],
    operationId: `assignCandidate${sfx}`,
    parameters: [pathParam("id")],
    requestBody: jsonReq("AssignCandidateRequestDto"),
    responses: { 200: jsonResp("CandidateResponseDto") }
  });
  addPath(`${p}/desks`, "get", {
    tags: ["candidate-review-controller"],
    operationId: `getActiveDesks${sfx}`,
    responses: { 200: jsonArrayResp("NewsroomDeskResponseDto") }
  });
  addPath(`${p}/dashboard`, "get", {
    tags: ["candidate-review-controller"],
    operationId: `getDashboardMetrics${sfx}`,
    responses: { 200: jsonResp("NewsroomDashboardMetricsDto") }
  });
  addPath(`${p}/candidates/{id}`, "get", {
    tags: ["candidate-review-controller"],
    operationId: `getCandidateById${sfx}`,
    parameters: [pathParam("id")],
    responses: { 200: jsonResp("CandidateResponseDto") }
  });
  addPath(`${p}/candidates`, "get", {
    tags: ["candidate-review-controller"],
    operationId: `listCandidates${sfx}`,
    responses: { 200: jsonResp("PageCandidateResponseDto") }
  });
});

// Editorial Production
for (const p of ["/api/v1/admin/editorial", "/admin/editorial"]) {
  const sfx = p === "/admin/editorial" ? "_1" : "";
  addPath(`${p}/planning`, "get", {
    tags: ["editorial-production-controller"],
    operationId: `getPlanningEvents${sfx}`,
    responses: { 200: jsonArrayResp("NewsroomPlanningEventJpaEntity") }
  });
  addPath(`${p}/planning`, "post", {
    tags: ["editorial-production-controller"],
    operationId: `createPlanningEvent${sfx}`,
    requestBody: jsonReq("CreatePlanningEventRequest"),
    responses: { 200: jsonResp("NewsroomPlanningEventJpaEntity") }
  });
  addPath(`${p}/comments`, "get", {
    tags: ["editorial-production-controller"],
    operationId: `getComments${sfx}`,
    responses: { 200: jsonArrayResp("NewsroomCommentJpaEntity") }
  });
  addPath(`${p}/comments`, "post", {
    tags: ["editorial-production-controller"],
    operationId: `addComment${sfx}`,
    requestBody: jsonReq("CreateCommentRequest"),
    responses: { 200: jsonResp("NewsroomCommentJpaEntity") }
  });
  addPath(`${p}/assignments/{id}/status`, "post", {
    tags: ["editorial-production-controller"],
    operationId: `updateAssignmentStatus${sfx}`,
    parameters: [pathParam("id")],
    requestBody: jsonReq("UpdateStatusRequest"),
    responses: { 200: jsonResp("EditorialAssignmentJpaEntity") }
  });
  addPath(`${p}/assignments`, "post", {
    tags: ["editorial-production-controller"],
    operationId: `createAssignment${sfx}`,
    requestBody: jsonReq("CreateAssignmentRequest"),
    responses: { 200: jsonResp("EditorialAssignmentJpaEntity") }
  });
  addPath(`${p}/articles/{articleId}/revisions/{revNum}/restore`, "post", {
    tags: ["editorial-production-controller"],
    operationId: `restoreRevision${sfx}`,
    parameters: [pathParam("articleId"), pathParam("revNum", "integer")],
    responses: { 200: jsonResp("ArticleResponse") }
  });
  addPath(`${p}/articles/{articleId}/revisions`, "get", {
    tags: ["editorial-production-controller"],
    operationId: `getRevisions${sfx}`,
    parameters: [pathParam("articleId")],
    responses: { 200: jsonArrayResp("ArticleRevisionJpaEntity") }
  });
  addPath(`${p}/articles/{articleId}/revisions`, "post", {
    tags: ["editorial-production-controller"],
    operationId: `createRevision${sfx}`,
    parameters: [pathParam("articleId")],
    requestBody: jsonReq("CreateRevisionRequest"),
    responses: { 200: jsonResp("ArticleRevisionJpaEntity") }
  });
  addPath(`${p}/articles/{articleId}/lock`, "get", {
    tags: ["editorial-production-controller"],
    operationId: `checkLock${sfx}`,
    parameters: [pathParam("articleId")],
    responses: { 200: jsonResp("ArticleLockJpaEntity") }
  });
  addPath(`${p}/articles/{articleId}/lock`, "post", {
    tags: ["editorial-production-controller"],
    operationId: `acquireLock${sfx}`,
    parameters: [pathParam("articleId")],
    responses: { 200: jsonResp("ArticleLockJpaEntity") }
  });
  addPath(`${p}/articles/{articleId}/lock`, "delete", {
    tags: ["editorial-production-controller"],
    operationId: `releaseLock${sfx}`,
    parameters: [pathParam("articleId")],
    responses: { 200: { description: "Lock released" } }
  });
  addPath(`${p}/articles/{articleId}/corrections`, "get", {
    tags: ["editorial-production-controller"],
    operationId: `getCorrections${sfx}`,
    parameters: [pathParam("articleId")],
    responses: { 200: jsonArrayResp("ArticleCorrectionJpaEntity") }
  });
  addPath(`${p}/articles/{articleId}/corrections`, "post", {
    tags: ["editorial-production-controller"],
    operationId: `addCorrection${sfx}`,
    parameters: [pathParam("articleId")],
    requestBody: jsonReq("CreateCorrectionRequest"),
    responses: { 200: jsonResp("ArticleCorrectionJpaEntity") }
  });
  addPath(`${p}/assignments/my`, "get", {
    tags: ["editorial-production-controller"],
    operationId: `getMyAssignments${sfx}`,
    responses: { 200: jsonArrayResp("EditorialAssignmentJpaEntity") }
  });
}

// Homepage Curation
for (const p of ["/api/v1/admin/curation/slots", "/admin/curation/slots"]) {
  const sfx = p.includes("admin/curation") && !p.includes("api/v1") ? "_1" : "";
  addPath(`${p}`, "post", {
    tags: ["homepage-curation-controller"],
    operationId: `assignArticleToSlot${sfx}`,
    requestBody: jsonReq("AssignSlotRequestDto"),
    responses: { 200: jsonResp("HomepagePlacementJpaEntity") }
  });
  addPath(`${p}`, "delete", {
    tags: ["homepage-curation-controller"],
    operationId: `removeArticleFromSlot${sfx}`,
    responses: { 200: { description: "Article removed from slot" } }
  });
  addPath(`${p}/{slotType}`, "get", {
    tags: ["homepage-curation-controller"],
    operationId: `getAdminSlotPlacements${sfx}`,
    parameters: [pathParam("slotType")],
    responses: { 200: jsonArrayResp("HomepagePlacementJpaEntity") }
  });
}
for (const p of ["/api/v1/public/curation/slots/{slotType}", "/public/curation/slots/{slotType}"]) {
  addPath(p, "get", {
    tags: ["homepage-curation-controller"],
    operationId: p.includes("api/v1") ? "getPublicSlotPlacements" : "getPublicSlotPlacements_1",
    parameters: [pathParam("slotType")],
    responses: { 200: jsonArrayResp("HomepagePlacementJpaEntity") }
  });
}

// Analytics Controller
addPath("/analytics/articles/{id}/view", "post", {
  tags: ["analytics-controller"],
  operationId: "trackView",
  parameters: [pathParam("id")],
  requestBody: jsonReq("TrackViewRequestDto", false),
  responses: { 200: { description: "View tracked" } }
});
addPath("/analytics/trending", "get", {
  tags: ["analytics-controller"],
  operationId: "getTrendingArticles",
  responses: { 200: jsonArrayResp("TrendingArticleDto") }
});
addPath("/analytics/dashboard", "get", {
  tags: ["analytics-controller"],
  operationId: "getDashboardMetrics_4",
  responses: { 200: jsonResp("AnalyticsDashboardDto") }
});
addPath("/analytics/authors/{id}", "get", {
  tags: ["analytics-controller"],
  operationId: "getAuthorAnalytics",
  parameters: [pathParam("id")],
  responses: { 200: jsonResp("AuthorAnalyticsDto") }
});
addPath("/analytics/articles/{id}", "get", {
  tags: ["analytics-controller"],
  operationId: "getArticleAnalytics",
  parameters: [pathParam("id")],
  responses: { 200: jsonResp("ArticleAnalyticsDto") }
});

// AI Controller
addPath("/ai/summary", "post", {
  tags: ["ai-controller"],
  operationId: "generateSummary",
  requestBody: jsonReq("SummaryRequestDto"),
  responses: { 200: jsonResp("SummaryResult") }
});
addPath("/ai/seo", "post", {
  tags: ["ai-controller"],
  operationId: "optimizeSeo",
  requestBody: jsonReq("SeoRequestDto"),
  responses: { 200: jsonResp("SeoResult") }
});
addPath("/ai/headline", "post", {
  tags: ["ai-controller"],
  operationId: "generateHeadline",
  requestBody: jsonReq("HeadlineRequestDto"),
  responses: { 200: jsonResp("HeadlineResult") }
});
addPath("/ai/completion", "post", {
  tags: ["ai-controller"],
  operationId: "completion",
  requestBody: jsonReq("CompletionRequestDto"),
  responses: { 200: jsonResp("LlmResponse") }
});

// Weather Data Controller
for (const p of ["/api/v1/weather", "/weather/snapshot", "/api/v1/weather/snapshot", "/weather"]) {
  let sfx = "";
  if (p === "/weather/snapshot") sfx = "_1";
  else if (p === "/api/v1/weather/snapshot") sfx = "_2";
  else if (p === "/weather") sfx = "_3";
  addPath(p, "get", {
    tags: ["weather-data-controller"],
    operationId: `getWeatherSnapshot${sfx}`,
    responses: { 200: jsonResp("CityWeatherResponseDto") }
  });
}

// Market Data Controller
for (const p of ["/api/v1/market/snapshot", "/api/v1/market", "/market", "/market/snapshot"]) {
  let sfx = "";
  if (p === "/api/v1/market") sfx = "_1";
  else if (p === "/market") sfx = "_2";
  else if (p === "/market/snapshot") sfx = "_3";
  addPath(p, "get", {
    tags: ["market-data-controller"],
    operationId: `getMarketSnapshot${sfx}`,
    responses: { 200: jsonResp("MarketSnapshotResponseDto") }
  });
}

// Auth Controller
addPath("/api/v1/auth/me", "get", {
  tags: ["auth-controller"],
  operationId: "me",
  responses: { 200: jsonResp("CurrentUserDto") }
});
addPath("/auth/me", "get", {
  tags: ["auth-controller"],
  operationId: "me_1",
  responses: { 200: jsonResp("CurrentUserDto") }
});

// Newsroom Audit Controller
addPath("/api/v1/admin/audit-logs", "get", {
  tags: ["newsroom-audit-controller"],
  operationId: "getAuditLogs",
  responses: { 200: jsonResp("PageNewsroomAuditLogJpaEntity") }
});
addPath("/admin/audit-logs", "get", {
  tags: ["newsroom-audit-controller"],
  operationId: "getAuditLogs_1",
  responses: { 200: jsonResp("PageNewsroomAuditLogJpaEntity") }
});

// Root API Controller
addPath("/api/v1/health", "get", {
  tags: ["root-api-controller"],
  operationId: "forwardToActuatorHealth",
  responses: { 200: { description: "Health OK" } }
});
addPath("/health", "get", {
  tags: ["root-api-controller"],
  operationId: "forwardToActuatorHealth_1",
  responses: { 200: { description: "Health OK" } }
});
addPath("/api/v1/actuator/health", "get", {
  tags: ["root-api-controller"],
  operationId: "forwardToActuatorHealth_2",
  responses: { 200: { description: "Health OK" } }
});
addPath("/", "get", {
  tags: ["root-api-controller"],
  operationId: "rootDiscovery",
  responses: { 200: { description: "Discovery OK" } }
});

// Write to openapi.json
const outputPath = path.resolve(rootDir, "openapi.json");
fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2), "utf8");
console.log(`Generated OpenAPI spec at ${outputPath} with ${Object.keys(spec.paths).length} paths and ${Object.keys(spec.components.schemas).length} schemas.`);
