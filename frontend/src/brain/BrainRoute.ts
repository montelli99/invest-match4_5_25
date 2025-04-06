import {
  ActivateAffiliateData,
  AddAttachmentData,
  AddAttachmentPayload,
  AddContentRuleData,
  AddContentRuleV1Data,
  AddPaymentMethodData,
  AddReactionData,
  AddReactionRequest,
  AnonymizationConfig,
  AnonymizeDataData,
  AppApisAiListBuilderSearchFilters,
  AppApisAuthUtilsTokenRequest,
  AppApisContactsIntroductionRequest,
  AppApisContentRulesAddContentRuleRequest,
  AppApisContentRulesPatternTestRequest,
  AppApisIntroductionsIntroductionRequest,
  AppApisModelsPatternTestRequest,
  AppApisModelsReportStatus,
  AppApisModelsSearchFilters,
  AppApisModelsTokenRequest,
  AppApisModerationAddContentRuleRequest,
  AppApisModerationSettingsModerationSettings,
  AppApisModerationSettingsV1ModerationSettings,
  AppApisModerationSettingsV1PatternTestRequest,
  AppApisSettingsVerificationSettings,
  AppApisVerificationSettingsModerationSettings,
  AppApisVerificationSettingsPatternTestRequest,
  AppApisVerificationSettingsVerificationSettings,
  BatchOperationRequest,
  BatchUpdateRulesData,
  BatchUpdateRulesPayload,
  BatchUpdateRulesV1Data,
  BodyAnonymizeData,
  BodyCreateTicket,
  BodySendMessageEndpoint,
  BodyUpdateContentRuleV1,
  BodyUpdateTicket,
  BodyUpdateTypingIndicator,
  BodyUploadAttachment,
  BodyUploadCapitalRaiserIssues,
  BodyUploadDocument,
  BodyUploadProfileImage,
  BodyUploadVerificationDocument,
  BulkEnrichInvestorProfilesData,
  BulkEnrichInvestorProfilesPayload,
  CalculateCommissionData,
  CalculateCommissionPayload,
  CalculateNetworkStrengthData,
  CalculateRelationshipStrengthData,
  CalculateTierData,
  CancelSubscriptionData,
  CancellationRequest,
  CheckHealthData,
  CheckHealthRouterData,
  CommissionStructure,
  ContactMatchSettings,
  ConvertReferralData,
  CreateCommentData,
  CreateCommentRequest,
  CreateCommissionStructureData,
  CreateConnectAccountData,
  CreateConnectAccountRequest,
  CreateIntroductionData,
  CreatePayoutData,
  CreateProfileData,
  CreateProfileRequest,
  CreateProfileV2Data,
  CreateReferralCodeData,
  CreateRelationshipData,
  CreateSearchPresetData,
  CreateTestPaymentData,
  CreateTestPaymentRequest,
  CreateTicketData,
  CreateTrackableLinkData,
  CreateTrackableLinkRequest,
  CreateTrialCodeData,
  CreateTrialCodeRequest,
  DeactivateTrialCodeData,
  DeleteCommentData,
  DeleteDocumentData,
  DeleteSearchPresetData,
  DocumentSectionRequest,
  DocumentType,
  DownloadAttachmentData,
  DownloadDocumentData,
  DownloadExportData,
  EmailNotification,
  EnrichInvestorProfileData,
  EnrichedInvestorProfile,
  EstimateExportSizeData,
  EstimateRequest,
  ExportAnalyticsData,
  ExportFormat,
  ExportRequest,
  ExportUserDataData,
  FeedbackRating,
  GetAdminAnalytics2Data,
  GetAdminAnalyticsByPathData,
  GetAdminAnalyticsDashboardData,
  GetAdminAnalyticsEndpointData,
  GetAdminAnalyticsRootData,
  GetAdminAuditLogsData,
  GetAdminAuditLogsPayload,
  GetAdminDashboardData,
  GetAdminRolePermissionsData,
  GetAdminRolePermissionsPayload,
  GetAffiliateSettingsEndpointData,
  GetAffiliateStatusEndpointData,
  GetAnalyticsSummary2Data,
  GetAnalyticsSummaryData,
  GetAnonymizationPreferencesData,
  GetAuditLogsData,
  GetCancellationStatusData,
  GetCapitalRaiserAnalyticsData,
  GetCapitalRaiserPerformanceData,
  GetCommentAnalyticsData,
  GetCommissionPaymentsData,
  GetCommissionStructureData,
  GetComprehensiveAnalytics2Data,
  GetComprehensiveAnalytics3Data,
  GetComprehensiveAnalyticsData,
  GetComprehensiveDashboardData,
  GetConnectAccountData,
  GetContactMatchesData,
  GetContentReports2Data,
  GetContentReports2Payload,
  GetContentReportsV12Data,
  GetContentReportsV1Data,
  GetContentReportsV1Payload,
  GetContentReportsV2Data,
  GetContentReportsWrapperData,
  GetContentRules2Data,
  GetContentRules2Payload,
  GetContentRulesData,
  GetContentRulesV12Data,
  GetContentRulesV12Result,
  GetContentRulesV1Data,
  GetContentRulesV1Payload,
  GetContentRulesV2Data,
  GetContentRulesWrapperData,
  GetConversationsData,
  GetDefaultRulesData,
  GetDocumentAnalyticsData,
  GetDocumentAuditLogsData,
  GetDocumentData,
  GetDocumentLinksData,
  GetDocumentSectionsData,
  GetDocumentVersionData,
  GetDocumentVersionsData,
  GetEntityData,
  GetEnumsData,
  GetExportProgressData,
  GetFeatureAccessData,
  GetFeedbackAnalyticsData,
  GetFundManagerAnalyticsData,
  GetFundManagerPerformanceData,
  GetFundSizeDistributionData,
  GetFundraisingAnalyticsData,
  GetGlobalMatchesData,
  GetHistoricalPerformanceData,
  GetHowtoGuideData,
  GetIntroductionData,
  GetIntroductionStatusData,
  GetInvestmentFocusDistributionData,
  GetInvestmentScorecardData,
  GetInvoicesData,
  GetKbArticleData,
  GetLpAnalyticsData,
  GetLpInvestmentPatternsData,
  GetMatchingAnalyticsData,
  GetMatchingSettingsData,
  GetMessagesData,
  GetModerationActions2Data,
  GetModerationActions2Payload,
  GetModerationActionsData,
  GetModerationActionsV1Data,
  GetModerationActionsV1Payload,
  GetModerationMetrics2Data,
  GetModerationMetrics2GetData,
  GetModerationMetrics2Payload,
  GetModerationMetricsData,
  GetModerationMetricsV1Data,
  GetModerationSettingsData,
  GetModerationSettingsV12Data,
  GetModerationSettingsV1Data,
  GetNetworkStrength2Data,
  GetNetworkStrengthData,
  GetPaymentMethodsData,
  GetPendingVerificationsData,
  GetPermissionsData,
  GetPermissionsPayload,
  GetProfileEndpointData,
  GetProfileV1Data,
  GetProfileV2Data,
  GetQuotaData,
  GetReactionsData,
  GetReferralLinksData,
  GetReferralStatsData,
  GetRefundStatusData,
  GetRelationshipData,
  GetRelationshipStrengthV1Data,
  GetRelationshipsData,
  GetRiskProfileDistributionData,
  GetRolePermissionsData,
  GetRuleEffectivenessData,
  GetRuleEffectivenessV1Data,
  GetRuleEffectivenessV1Payload,
  GetSearchHistoryData,
  GetSectorPerformanceData,
  GetSourceStatusData,
  GetStorageStatsData,
  GetSubscriptionFeaturesData,
  GetSubscriptionPlansData,
  GetTestPaymentData,
  GetTicketData,
  GetTicketPayload,
  GetTierRequirementsData,
  GetTierStatusData,
  GetTransactionsData,
  GetTypingStatusData,
  GetUserConnectAccountsData,
  GetUserMatchesData,
  GetUserMatchesRequest,
  GetUserPresetsData,
  GetUserRelationshipsData,
  GetUserSubscriptionData,
  GetUserTypeAnalyticsData,
  GetVerificationConfigData,
  GetVerificationSettingsData,
  GetVerificationStatusData,
  GetVisibilitySettingsData,
  HealthCheckData,
  ImportContactsData,
  ImportContactsRequest,
  Interaction,
  IntroductionUpdate,
  ListAdminUsersData,
  ListAdminUsersPayload,
  ListCapitalRaiserIssuesData,
  ListCommentsData,
  ListCommissionStructuresData,
  ListContactsData,
  ListDocumentsData,
  ListHowtoGuidesData,
  ListKbArticlesData,
  ListProfilesRequest,
  ListProfilesV1Data,
  ListProfilesV2Data,
  ListTestPaymentsData,
  ListTicketsData,
  ListTicketsPayload,
  ListTrialCodesData,
  ListUserIntroductionsData,
  MarkThreadReadStatusData,
  ModerateCommentData,
  PayoutRequest,
  PeriodFilter,
  ProcessCommissionPaymentData,
  ProfileVisibility,
  ReactToCommentData,
  RecordAnalyticsEventData,
  RecordEventRequest,
  RecordInteractionData,
  RecordMatchData,
  RecordMatchRequest,
  RefreshDataData,
  RefundRequest,
  RegisterDocumentSectionsData,
  Relationship,
  RelationshipStatus,
  RemoveReactionData,
  RemoveReactionRequest,
  ReportCommentData,
  RequestIntroductionData,
  RequestRefundData,
  RestoreDocumentVersionData,
  ReviewDocumentData,
  ReviewRequest,
  RouteAdminAnalyticsDashboardEndpointData,
  SaveAnonymizationPreferencesData,
  SearchCommentsData,
  SearchEntitiesData,
  SearchInvestorsData,
  SearchKbArticlesData,
  SearchPresetInput,
  SearchUsersData,
  SendMessageEndpointData,
  ShareDocumentData,
  ShareDocumentPayload,
  StartTrialData,
  StartTrialRequest,
  StoreProfileEndpointData,
  StoreProfileEndpointPayload,
  SubmitFeedbackData,
  SubmitVerificationData,
  SubscriptionUpdate,
  TestEmailNotificationData,
  TestFileTypeDetectionData,
  TestMalwareDetectionData,
  TestModerationPatternData,
  TestPattern2Data,
  TestPatternData,
  TestPatternV12Data,
  TestPatternV1Data,
  TicketStatus,
  ToggleThreadMuteData,
  TrackReferralData,
  TrackReferralVisitData,
  TransferOwnershipData,
  TransferOwnershipRequest,
  UpdateAffiliateSettingsData,
  UpdateAffiliateSettingsPayload,
  UpdateCommentData,
  UpdateCommentRequest,
  UpdateCommissionStructureData,
  UpdateContentRuleData,
  UpdateContentRulePayload,
  UpdateContentRuleV1Data,
  UpdateContentRulesData,
  UpdateContentRulesPayload,
  UpdateContentRulesV1Data,
  UpdateContentRulesV1Payload,
  UpdateIntroductionStatusData,
  UpdateMatchPreferencesData,
  UpdateMatchingSettingsData,
  UpdateModerationSettingsData,
  UpdateModerationSettingsV12Data,
  UpdateModerationSettingsV1Data,
  UpdatePreferencesRequest,
  UpdatePresetLastUsedData,
  UpdateProfileEndpointData,
  UpdateProfileEndpointPayload,
  UpdateProfileManagementData,
  UpdateProfileManagementPayload,
  UpdateRelationshipStatusData,
  UpdateReportRequest,
  UpdateReportStatus2Data,
  UpdateReportStatusData,
  UpdateReportStatusRequest,
  UpdateReportStatusV1Data,
  UpdateRolePermissionsData,
  UpdateRolePermissionsRequest,
  UpdateSubscriptionData,
  UpdateTicketData,
  UpdateTypingIndicatorData,
  UpdateUserRoleData,
  UpdateUserRoleRequest,
  UpdateUserStatusData,
  UpdateUserStatusRequest,
  UpdateVerificationConfigData,
  UpdateVerificationSettingsData,
  UpdateVisibilityManagementData,
  UpdateVisibilityRequest,
  UpdateVisibilitySettingsData,
  UploadAttachmentData,
  UploadCapitalRaiserIssuesData,
  UploadDocumentData,
  UploadProfileImageData,
  UploadVerificationDocumentData,
  UserType,
  VerificationRequest,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Get audit logs with optional limit
   * @tags dbtn/module:audit
   * @name get_audit_logs
   * @summary Get Audit Logs
   * @request GET:/routes/audit/logs
   */
  export namespace get_audit_logs {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Limit
       * @default 100
       */
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAuditLogsData;
  }

  /**
   * @description Get audit logs for a specific document
   * @tags dbtn/module:audit
   * @name get_document_audit_logs
   * @summary Get Document Audit Logs
   * @request GET:/routes/audit/logs/document/{document_id}
   */
  export namespace get_document_audit_logs {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDocumentAuditLogsData;
  }

  /**
   * @description Anonymize data according to specified rules Args: data: The data to anonymize config: Anonymization configuration including rules Returns: AnonymizedData containing the anonymized data and list of applied rules
   * @tags dbtn/module:privacy
   * @name anonymize_data
   * @summary Anonymize Data
   * @request POST:/routes/anonymize-data
   */
  export namespace anonymize_data {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyAnonymizeData;
    export type RequestHeaders = {};
    export type ResponseBody = AnonymizeDataData;
  }

  /**
   * @description Get default anonymization rules for common data types
   * @tags dbtn/module:privacy
   * @name get_default_rules
   * @summary Get Default Rules
   * @request GET:/routes/default-rules
   */
  export namespace get_default_rules {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDefaultRulesData;
  }

  /**
   * @description Save user's anonymization preferences
   * @tags dbtn/module:privacy
   * @name save_anonymization_preferences
   * @summary Save Anonymization Preferences
   * @request POST:/routes/save-preferences
   */
  export namespace save_anonymization_preferences {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AnonymizationConfig;
    export type RequestHeaders = {};
    export type ResponseBody = SaveAnonymizationPreferencesData;
  }

  /**
   * @description Get user's saved anonymization preferences
   * @tags dbtn/module:privacy
   * @name get_anonymization_preferences
   * @summary Get Anonymization Preferences
   * @request GET:/routes/get-preferences/{user_id}
   */
  export namespace get_anonymization_preferences {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAnonymizationPreferencesData;
  }

  /**
   * @description Run comprehensive tests for file type detection
   * @tags dbtn/module:file_type_tests
   * @name test_file_type_detection
   * @summary Test File Type Detection
   * @request POST:/routes/test/file-type-detection
   */
  export namespace test_file_type_detection {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TestFileTypeDetectionData;
  }

  /**
   * @description Test malware detection capabilities
   * @tags dbtn/module:file_type_tests
   * @name test_malware_detection
   * @summary Test Malware Detection
   * @request POST:/routes/test/malware-detection
   */
  export namespace test_malware_detection {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TestMalwareDetectionData;
  }

  /**
   * No description
   * @tags dbtn/module:message_reactions
   * @name add_reaction
   * @summary Add Reaction
   * @request POST:/routes/add-reaction
   */
  export namespace add_reaction {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AddReactionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AddReactionData;
  }

  /**
   * No description
   * @tags dbtn/module:message_reactions
   * @name remove_reaction
   * @summary Remove Reaction
   * @request POST:/routes/remove-reaction
   */
  export namespace remove_reaction {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RemoveReactionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RemoveReactionData;
  }

  /**
   * No description
   * @tags dbtn/module:message_reactions
   * @name get_reactions
   * @summary Get Reactions
   * @request GET:/routes/get-reactions/{message_id}
   */
  export namespace get_reactions {
    export type RequestParams = {
      /** Message Id */
      messageId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetReactionsData;
  }

  /**
   * @description Submit user feedback for a page
   * @tags dbtn/module:feedback
   * @name submit_feedback
   * @summary Submit Feedback
   * @request POST:/routes/submit-feedback
   */
  export namespace submit_feedback {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FeedbackRating;
    export type RequestHeaders = {};
    export type ResponseBody = SubmitFeedbackData;
  }

  /**
   * @description Get analytics for collected feedback
   * @tags dbtn/module:feedback
   * @name get_feedback_analytics
   * @summary Get Feedback Analytics
   * @request GET:/routes/feedback-analytics
   */
  export namespace get_feedback_analytics {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetFeedbackAnalyticsData;
  }

  /**
   * @description Test endpoint for email notifications
   * @tags notifications, dbtn/module:notifications
   * @name test_email_notification
   * @summary Test Email Notification
   * @request POST:/routes/api/notifications/test-email
   */
  export namespace test_email_notification {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = EmailNotification;
    export type RequestHeaders = {};
    export type ResponseBody = TestEmailNotificationData;
  }

  /**
   * @description Create a new comment on a ticket
   * @tags comments, stream, dbtn/module:comments
   * @name create_comment
   * @summary Create Comment
   * @request POST:/routes/api/comments
   */
  export namespace create_comment {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateCommentRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateCommentData;
  }

  /**
   * @description Get all comments for a ticket
   * @tags comments, stream, dbtn/module:comments
   * @name list_comments
   * @summary List Comments
   * @request GET:/routes/api/comments/tickets/{ticket_id}
   */
  export namespace list_comments {
    export type RequestParams = {
      /** Ticket Id */
      ticketId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListCommentsData;
  }

  /**
   * @description Update an existing comment
   * @tags comments, stream, dbtn/module:comments
   * @name update_comment
   * @summary Update Comment
   * @request PUT:/routes/api/comments/{comment_id}
   */
  export namespace update_comment {
    export type RequestParams = {
      /** Comment Id */
      commentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateCommentRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateCommentData;
  }

  /**
   * @description Delete a comment
   * @tags comments, stream, dbtn/module:comments
   * @name delete_comment
   * @summary Delete Comment
   * @request DELETE:/routes/api/comments/{comment_id}
   */
  export namespace delete_comment {
    export type RequestParams = {
      /** Comment Id */
      commentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteCommentData;
  }

  /**
   * @description React to a comment with an emoji
   * @tags comments, stream, dbtn/module:comments
   * @name react_to_comment
   * @summary React To Comment
   * @request POST:/routes/api/comments/{comment_id}/react
   */
  export namespace react_to_comment {
    export type RequestParams = {
      /** Comment Id */
      commentId: string;
    };
    export type RequestQuery = {
      /** Emoji */
      emoji: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ReactToCommentData;
  }

  /**
   * @description Report a comment for moderation
   * @tags comments, stream, dbtn/module:comments
   * @name report_comment
   * @summary Report Comment
   * @request POST:/routes/api/comments/{comment_id}/report
   */
  export namespace report_comment {
    export type RequestParams = {
      /** Comment Id */
      commentId: string;
    };
    export type RequestQuery = {
      /** Reason */
      reason: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ReportCommentData;
  }

  /**
   * @description Moderate a reported comment (admin only)
   * @tags comments, stream, dbtn/module:comments
   * @name moderate_comment
   * @summary Moderate Comment
   * @request POST:/routes/api/comments/{comment_id}/moderate
   */
  export namespace moderate_comment {
    export type RequestParams = {
      /** Comment Id */
      commentId: string;
    };
    export type RequestQuery = {
      /** Status */
      status: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ModerateCommentData;
  }

  /**
   * @description Search comments by content
   * @tags comments, stream, dbtn/module:comments
   * @name search_comments
   * @summary Search Comments
   * @request GET:/routes/api/comments/search
   */
  export namespace search_comments {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Q */
      q: string;
      /** Ticket Id */
      ticket_id?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SearchCommentsData;
  }

  /**
   * @description Get analytics about comments
   * @tags comments, stream, dbtn/module:comments
   * @name get_comment_analytics
   * @summary Get Comment Analytics
   * @request GET:/routes/api/comments/analytics
   */
  export namespace get_comment_analytics {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCommentAnalyticsData;
  }

  /**
   * No description
   * @tags dbtn/module:capital_raiser_issues
   * @name upload_capital_raiser_issues
   * @summary Upload Capital Raiser Issues
   * @request POST:/routes/upload-issues
   */
  export namespace upload_capital_raiser_issues {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyUploadCapitalRaiserIssues;
    export type RequestHeaders = {};
    export type ResponseBody = UploadCapitalRaiserIssuesData;
  }

  /**
   * No description
   * @tags dbtn/module:capital_raiser_issues
   * @name list_capital_raiser_issues
   * @summary List Capital Raiser Issues
   * @request GET:/routes/list-issues
   */
  export namespace list_capital_raiser_issues {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListCapitalRaiserIssuesData;
  }

  /**
   * @description Enrich investor profile with Crunchbase data
   * @tags dbtn/module:investor_enrichment
   * @name enrich_investor_profile
   * @summary Enrich Investor Profile
   * @request POST:/routes/enrich
   */
  export namespace enrich_investor_profile {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = EnrichedInvestorProfile;
    export type RequestHeaders = {};
    export type ResponseBody = EnrichInvestorProfileData;
  }

  /**
   * @description Enrich multiple investor profiles with Crunchbase data
   * @tags dbtn/module:investor_enrichment
   * @name bulk_enrich_investor_profiles
   * @summary Bulk Enrich Investor Profiles
   * @request POST:/routes/bulk-enrich
   */
  export namespace bulk_enrich_investor_profiles {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BulkEnrichInvestorProfilesPayload;
    export type RequestHeaders = {};
    export type ResponseBody = BulkEnrichInvestorProfilesData;
  }

  /**
   * @description Get comprehensive analytics for an investment manager
   * @tags dbtn/module:sec_analytics
   * @name get_comprehensive_analytics
   * @summary Get Comprehensive Analytics
   * @request GET:/routes/analytics/{cik}
   */
  export namespace get_comprehensive_analytics {
    export type RequestParams = {
      /** Cik */
      cik: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetComprehensiveAnalyticsData;
  }

  /**
   * @description List all how-to guides
   * @tags how-to-guides, dbtn/module:howto_guides
   * @name list_howto_guides
   * @summary List Howto Guides
   * @request GET:/routes/guides
   */
  export namespace list_howto_guides {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListHowtoGuidesData;
  }

  /**
   * @description Get a specific how-to guide
   * @tags how-to-guides, dbtn/module:howto_guides
   * @name get_howto_guide
   * @summary Get Howto Guide
   * @request GET:/routes/guides/{guide_id}
   */
  export namespace get_howto_guide {
    export type RequestParams = {
      /** Guide Id */
      guideId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetHowtoGuideData;
  }

  /**
   * @description Create a new support ticket
   * @tags support, dbtn/module:support
   * @name create_ticket
   * @summary Create Ticket
   * @request POST:/routes/support/tickets
   */
  export namespace create_ticket {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyCreateTicket;
    export type RequestHeaders = {};
    export type ResponseBody = CreateTicketData;
  }

  /**
   * @description List all tickets or filter by status
   * @tags support, dbtn/module:support
   * @name list_tickets
   * @summary List Tickets
   * @request GET:/routes/support/tickets
   */
  export namespace list_tickets {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Status */
      status?: TicketStatus | null;
    };
    export type RequestBody = ListTicketsPayload;
    export type RequestHeaders = {};
    export type ResponseBody = ListTicketsData;
  }

  /**
   * @description Get a specific ticket
   * @tags support, dbtn/module:support
   * @name get_ticket
   * @summary Get Ticket
   * @request GET:/routes/support/tickets/{ticket_id}
   */
  export namespace get_ticket {
    export type RequestParams = {
      /** Ticket Id */
      ticketId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = GetTicketPayload;
    export type RequestHeaders = {};
    export type ResponseBody = GetTicketData;
  }

  /**
   * @description Update a ticket
   * @tags support, dbtn/module:support
   * @name update_ticket
   * @summary Update Ticket
   * @request PUT:/routes/support/tickets/{ticket_id}
   */
  export namespace update_ticket {
    export type RequestParams = {
      /** Ticket Id */
      ticketId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = BodyUpdateTicket;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateTicketData;
  }

  /**
   * @description Add an attachment to a ticket Args: ticket_id: ID of the ticket to attach file to file: Base64 encoded file content token: Authentication token Returns: Updated ticket with new attachment Raises: HTTPException: If file is invalid or too large
   * @tags support, dbtn/module:support
   * @name add_attachment
   * @summary Add Attachment
   * @request POST:/routes/support/tickets/{ticket_id}/attachments
   */
  export namespace add_attachment {
    export type RequestParams = {
      /** Ticket Id */
      ticketId: string;
    };
    export type RequestQuery = {
      /** File */
      file: string;
    };
    export type RequestBody = AddAttachmentPayload;
    export type RequestHeaders = {};
    export type ResponseBody = AddAttachmentData;
  }

  /**
   * @description Search for potential investors across multiple data sources - Uses efficient caching with compression - Implements batch processing for API calls - Optimizes memory usage - Provides cache hit/miss metrics - Implements progress tracking
   * @tags AI List Builder, dbtn/module:ai_list_builder
   * @name search_investors
   * @summary Search Investors
   * @request POST:/routes/ai_list_builder/search
   */
  export namespace search_investors {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisAiListBuilderSearchFilters;
    export type RequestHeaders = {};
    export type ResponseBody = SearchInvestorsData;
  }

  /**
   * @description Get the status of each data source
   * @tags AI List Builder, dbtn/module:ai_list_builder
   * @name get_source_status
   * @summary Get Source Status
   * @request GET:/routes/ai_list_builder/sources/status
   */
  export namespace get_source_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSourceStatusData;
  }

  /**
   * @description Get distribution of investment focus areas
   * @tags AI List Builder, dbtn/module:ai_list_builder
   * @name get_investment_focus_distribution
   * @summary Get Investment Focus Distribution
   * @request GET:/routes/ai_list_builder/analytics/investment-focus
   */
  export namespace get_investment_focus_distribution {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetInvestmentFocusDistributionData;
  }

  /**
   * @description Get distribution of fund sizes
   * @tags AI List Builder, dbtn/module:ai_list_builder
   * @name get_fund_size_distribution
   * @summary Get Fund Size Distribution
   * @request GET:/routes/ai_list_builder/analytics/fund-size
   */
  export namespace get_fund_size_distribution {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetFundSizeDistributionData;
  }

  /**
   * @description Get historical performance trends
   * @tags AI List Builder, dbtn/module:ai_list_builder
   * @name get_historical_performance
   * @summary Get Historical Performance
   * @request GET:/routes/ai_list_builder/analytics/historical-performance
   */
  export namespace get_historical_performance {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetHistoricalPerformanceData;
  }

  /**
   * @description Get distribution of risk profiles
   * @tags AI List Builder, dbtn/module:ai_list_builder
   * @name get_risk_profile_distribution
   * @summary Get Risk Profile Distribution
   * @request GET:/routes/ai_list_builder/analytics/risk-profile
   */
  export namespace get_risk_profile_distribution {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetRiskProfileDistributionData;
  }

  /**
   * @description Manually trigger a refresh of all data sources
   * @tags AI List Builder, dbtn/module:ai_list_builder
   * @name refresh_data
   * @summary Refresh Data
   * @request POST:/routes/ai_list_builder/refresh
   */
  export namespace refresh_data {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RefreshDataData;
  }

  /**
   * @description List all knowledge base articles
   * @tags knowledge-base, dbtn/module:knowledge_base
   * @name list_kb_articles
   * @summary List Kb Articles
   * @request GET:/routes/kb
   */
  export namespace list_kb_articles {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListKbArticlesData;
  }

  /**
   * @description Get a specific knowledge base article
   * @tags knowledge-base, dbtn/module:knowledge_base
   * @name get_kb_article
   * @summary Get Kb Article
   * @request GET:/routes/kb/{article_id}
   */
  export namespace get_kb_article {
    export type RequestParams = {
      /** Article Id */
      articleId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetKbArticleData;
  }

  /**
   * @description Search knowledge base articles based on query
   * @tags knowledge-base, dbtn/module:knowledge_base
   * @name search_kb_articles
   * @summary Search Kb Articles
   * @request GET:/routes/kb/search/{search_query}
   */
  export namespace search_kb_articles {
    export type RequestParams = {
      /** Search Query */
      searchQuery: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SearchKbArticlesData;
  }

  /**
   * @description Get entity details from Crunchbase
   * @tags dbtn/module:crunchbase_integration
   * @name get_entity
   * @summary Get Entity
   * @request GET:/routes/entity/{entity_id}
   */
  export namespace get_entity {
    export type RequestParams = {
      /** Entity Id */
      entityId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetEntityData;
  }

  /**
   * @description Search for entities in Crunchbase
   * @tags dbtn/module:crunchbase_integration
   * @name search_entities
   * @summary Search Entities
   * @request GET:/routes/search/{search_query}
   */
  export namespace search_entities {
    export type RequestParams = {
      /** Search Query */
      searchQuery: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SearchEntitiesData;
  }

  /**
   * @description Create a test payment This endpoint simulates payment processing with different test cards and scenarios. Use specific test card numbers to trigger different payment outcomes.
   * @tags dbtn/module:test_payments
   * @name create_test_payment
   * @summary Create Test Payment
   * @request POST:/routes/test-payments/create
   */
  export namespace create_test_payment {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateTestPaymentRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateTestPaymentData;
  }

  /**
   * @description Get a specific test payment
   * @tags dbtn/module:test_payments
   * @name get_test_payment
   * @summary Get Test Payment
   * @request GET:/routes/test-payments/{payment_id}
   */
  export namespace get_test_payment {
    export type RequestParams = {
      /** Payment Id */
      paymentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetTestPaymentData;
  }

  /**
   * @description List all test payments
   * @tags dbtn/module:test_payments
   * @name list_test_payments
   * @summary List Test Payments
   * @request GET:/routes/test-payments
   */
  export namespace list_test_payments {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListTestPaymentsData;
  }

  /**
   * @description Calculate commission based on structure and inputs Args: structure_id: ID of commission structure to use base_amount: Base amount to calculate commission on metrics: Optional performance metrics volume: Optional volume for volume-based calculations Returns: CommissionCalculation with detailed breakdown Raises: HTTPException: If structure not found or calculation fails
   * @tags dbtn/module:commission_calculator
   * @name calculate_commission
   * @summary Calculate Commission
   * @request POST:/routes/commission/calculate
   */
  export namespace calculate_commission {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Structure Id */
      structure_id: string;
      /** Base Amount */
      base_amount: number;
      /** Volume */
      volume?: number | null;
    };
    export type RequestBody = CalculateCommissionPayload;
    export type RequestHeaders = {};
    export type ResponseBody = CalculateCommissionData;
  }

  /**
   * @description Create a new commission structure Args: structure: Commission structure to create Returns: Created commission structure Raises: HTTPException: If creation fails
   * @tags dbtn/module:commission_calculator
   * @name create_commission_structure
   * @summary Create Commission Structure
   * @request POST:/routes/commission/structures/create
   */
  export namespace create_commission_structure {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CommissionStructure;
    export type RequestHeaders = {};
    export type ResponseBody = CreateCommissionStructureData;
  }

  /**
   * @description Get a specific commission structure Args: structure_id: ID of structure to retrieve Returns: Commission structure Raises: HTTPException: If structure not found
   * @tags dbtn/module:commission_calculator
   * @name get_commission_structure
   * @summary Get Commission Structure
   * @request GET:/routes/commission/structures/{structure_id}
   */
  export namespace get_commission_structure {
    export type RequestParams = {
      /** Structure Id */
      structureId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCommissionStructureData;
  }

  /**
   * @description Update an existing commission structure Args: structure_id: ID of structure to update updates: Updated commission structure Returns: Updated commission structure Raises: HTTPException: If update fails
   * @tags dbtn/module:commission_calculator
   * @name update_commission_structure
   * @summary Update Commission Structure
   * @request PUT:/routes/commission/structures/{structure_id}
   */
  export namespace update_commission_structure {
    export type RequestParams = {
      /** Structure Id */
      structureId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = CommissionStructure;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateCommissionStructureData;
  }

  /**
   * @description List all commission structures Args: include_inactive: Whether to include inactive structures Returns: List of commission structures
   * @tags dbtn/module:commission_calculator
   * @name list_commission_structures
   * @summary List Commission Structures
   * @request GET:/routes/commission/structures
   */
  export namespace list_commission_structures {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Include Inactive
       * @default false
       */
      include_inactive?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListCommissionStructuresData;
  }

  /**
   * @description Create a new introduction request
   * @tags dbtn/module:introductions
   * @name create_introduction
   * @summary Create Introduction
   * @request POST:/routes/introductions
   */
  export namespace create_introduction {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisIntroductionsIntroductionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateIntroductionData;
  }

  /**
   * @description Get details of a specific introduction
   * @tags dbtn/module:introductions
   * @name get_introduction
   * @summary Get Introduction
   * @request GET:/routes/introductions/{intro_id}
   */
  export namespace get_introduction {
    export type RequestParams = {
      /** Intro Id */
      introId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetIntroductionData;
  }

  /**
   * @description Update the status of an introduction
   * @tags dbtn/module:introductions
   * @name update_introduction_status
   * @summary Update Introduction Status
   * @request PATCH:/routes/introductions/{intro_id}
   */
  export namespace update_introduction_status {
    export type RequestParams = {
      /** Intro Id */
      introId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = IntroductionUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateIntroductionStatusData;
  }

  /**
   * @description List all introductions for a user
   * @tags dbtn/module:introductions
   * @name list_user_introductions
   * @summary List User Introductions
   * @request GET:/routes/users/{user_id}/introductions
   */
  export namespace list_user_introductions {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListUserIntroductionsData;
  }

  /**
   * @description Get just the status of an introduction
   * @tags dbtn/module:introductions
   * @name get_introduction_status
   * @summary Get Introduction Status
   * @request GET:/routes/introductions/{intro_id}/status
   */
  export namespace get_introduction_status {
    export type RequestParams = {
      /** Intro Id */
      introId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetIntroductionStatusData;
  }

  /**
   * @description Get the requirements and benefits for each tier
   * @tags dbtn/module:tier_progression
   * @name get_tier_requirements
   * @summary Get Tier Requirements
   * @request GET:/routes/tier-requirements
   */
  export namespace get_tier_requirements {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetTierRequirementsData;
  }

  /**
   * @description Get current tier status and progression for a user
   * @tags dbtn/module:tier_progression
   * @name get_tier_status
   * @summary Get Tier Status
   * @request GET:/routes/tier-status/{user_id}
   */
  export namespace get_tier_status {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetTierStatusData;
  }

  /**
   * @description Calculate and update user's tier based on their performance
   * @tags dbtn/module:tier_progression
   * @name calculate_tier
   * @summary Calculate Tier
   * @request POST:/routes/calculate-tier/{user_id}
   */
  export namespace calculate_tier {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CalculateTierData;
  }

  /**
   * No description
   * @tags dbtn/module:referral
   * @name create_referral_code
   * @summary Create Referral Code
   * @request POST:/routes/referral/create-code
   */
  export namespace create_referral_code {
    export type RequestParams = {};
    export type RequestQuery = {
      /** User Id */
      user_id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CreateReferralCodeData;
  }

  /**
   * @description Get all referral links for a user
   * @tags dbtn/module:referral
   * @name get_referral_links
   * @summary Get Referral Links
   * @request GET:/routes/referral/get-links/{user_id}
   */
  export namespace get_referral_links {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetReferralLinksData;
  }

  /**
   * @description Track a visit to a referral link
   * @tags dbtn/module:referral
   * @name track_referral_visit
   * @summary Track Referral Visit
   * @request POST:/routes/referral/track-visit
   */
  export namespace track_referral_visit {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Referral Code */
      referral_code: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TrackReferralVisitData;
  }

  /**
   * @description Process commission payment for an affiliate
   * @tags dbtn/module:referral
   * @name process_commission_payment
   * @summary Process Commission Payment
   * @request POST:/routes/referral/process-commission-payment/{affiliate_id}
   */
  export namespace process_commission_payment {
    export type RequestParams = {
      /** Affiliate Id */
      affiliateId: string;
    };
    export type RequestQuery = {
      /** Payment Method */
      payment_method: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ProcessCommissionPaymentData;
  }

  /**
   * @description Get commission payment history for an affiliate
   * @tags dbtn/module:referral
   * @name get_commission_payments
   * @summary Get Commission Payments
   * @request GET:/routes/referral/get-commission-payments/{affiliate_id}
   */
  export namespace get_commission_payments {
    export type RequestParams = {
      /** Affiliate Id */
      affiliateId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCommissionPaymentsData;
  }

  /**
   * No description
   * @tags dbtn/module:referral
   * @name track_referral
   * @summary Track Referral
   * @request POST:/routes/referral/track-referral
   */
  export namespace track_referral {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Referral Code */
      referral_code: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TrackReferralData;
  }

  /**
   * No description
   * @tags dbtn/module:referral
   * @name convert_referral
   * @summary Convert Referral
   * @request POST:/routes/referral/convert-referral/{tracking_id}
   */
  export namespace convert_referral {
    export type RequestParams = {
      /** Tracking Id */
      trackingId: string;
    };
    export type RequestQuery = {
      /** Referred User Id */
      referred_user_id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ConvertReferralData;
  }

  /**
   * No description
   * @tags dbtn/module:referral
   * @name activate_affiliate
   * @summary Activate Affiliate
   * @request POST:/routes/referral/activate-affiliate
   */
  export namespace activate_affiliate {
    export type RequestParams = {};
    export type RequestQuery = {
      /** User Id */
      user_id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ActivateAffiliateData;
  }

  /**
   * @description Get affiliate status for a user Args: user_id: ID of the user Returns: Current affiliate status
   * @tags dbtn/module:referral
   * @name get_affiliate_status_endpoint
   * @summary Get Affiliate Status Endpoint
   * @request GET:/routes/referral/get-affiliate-status/{user_id}
   */
  export namespace get_affiliate_status_endpoint {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAffiliateStatusEndpointData;
  }

  /**
   * @description Update affiliate settings for a user Args: user_id: ID of the user settings: New settings to apply Returns: Updated settings Raises: HTTPException: If settings cannot be updated
   * @tags dbtn/module:referral
   * @name update_affiliate_settings
   * @summary Update Affiliate Settings
   * @request POST:/routes/referral/update-settings/{user_id}
   */
  export namespace update_affiliate_settings {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateAffiliateSettingsPayload;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateAffiliateSettingsData;
  }

  /**
   * @description Get affiliate settings for a user Args: user_id: ID of the user Returns: Current affiliate settings
   * @tags dbtn/module:referral
   * @name get_affiliate_settings_endpoint
   * @summary Get Affiliate Settings Endpoint
   * @request GET:/routes/referral/get-settings/{user_id}
   */
  export namespace get_affiliate_settings_endpoint {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAffiliateSettingsEndpointData;
  }

  /**
   * @description Get all referral relationships for a user
   * @tags dbtn/module:referral
   * @name get_relationships
   * @summary Get Relationships
   * @request GET:/routes/referral/get-relationships/{user_id}
   */
  export namespace get_relationships {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetRelationshipsData;
  }

  /**
   * No description
   * @tags dbtn/module:referral
   * @name get_referral_stats
   * @summary Get Referral Stats
   * @request GET:/routes/referral/get-referral-stats/{user_id}
   */
  export namespace get_referral_stats {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetReferralStatsData;
  }

  /**
   * @description Send a message endpoint
   * @tags dbtn/module:messaging_enhanced
   * @name send_message_endpoint
   * @summary Send Message Endpoint
   * @request POST:/routes/messages/send
   */
  export namespace send_message_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodySendMessageEndpoint;
    export type RequestHeaders = {};
    export type ResponseBody = SendMessageEndpointData;
  }

  /**
   * @description Toggle mute status for a thread
   * @tags dbtn/module:messaging_enhanced
   * @name toggle_thread_mute
   * @summary Toggle Thread Mute
   * @request POST:/routes/messages/threads/{thread_id}/mute
   */
  export namespace toggle_thread_mute {
    export type RequestParams = {
      /** Thread Id */
      threadId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = AppApisAuthUtilsTokenRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ToggleThreadMuteData;
  }

  /**
   * @description Mark a thread as read or unread
   * @tags dbtn/module:messaging_enhanced
   * @name mark_thread_read_status
   * @summary Mark Thread Read Status
   * @request POST:/routes/messages/threads/{thread_id}/read
   */
  export namespace mark_thread_read_status {
    export type RequestParams = {
      /** Thread Id */
      threadId: string;
    };
    export type RequestQuery = {
      /** Is Read */
      is_read: boolean;
    };
    export type RequestBody = AppApisAuthUtilsTokenRequest;
    export type RequestHeaders = {};
    export type ResponseBody = MarkThreadReadStatusData;
  }

  /**
   * @description Get messages between current user and another user with enhanced thread support
   * @tags dbtn/module:messaging_enhanced
   * @name get_messages
   * @summary Get Messages
   * @request GET:/routes/messages/{other_user_id}
   */
  export namespace get_messages {
    export type RequestParams = {
      /** Other User Id */
      otherUserId: string;
    };
    export type RequestQuery = {
      /**
       * Page
       * @default 1
       */
      page?: number;
      /**
       * Page Size
       * @default 50
       */
      page_size?: number;
      /** Thread Id */
      thread_id?: string | null;
    };
    export type RequestBody = AppApisAuthUtilsTokenRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GetMessagesData;
  }

  /**
   * @description Update typing indicator with automatic cleanup
   * @tags dbtn/module:messaging_enhanced
   * @name update_typing_indicator
   * @summary Update Typing Indicator
   * @request POST:/routes/messages/typing
   */
  export namespace update_typing_indicator {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyUpdateTypingIndicator;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateTypingIndicatorData;
  }

  /**
   * @description Get typing status for a user
   * @tags dbtn/module:messaging_enhanced
   * @name get_typing_status
   * @summary Get Typing Status
   * @request GET:/routes/messages/typing/{other_user_id}
   */
  export namespace get_typing_status {
    export type RequestParams = {
      /** Other User Id */
      otherUserId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = AppApisAuthUtilsTokenRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GetTypingStatusData;
  }

  /**
   * @description Get all conversations for the current user
   * @tags dbtn/module:messaging_enhanced
   * @name get_conversations
   * @summary Get Conversations
   * @request GET:/routes/conversations
   */
  export namespace get_conversations {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisAuthUtilsTokenRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GetConversationsData;
  }

  /**
   * @description Get all relationships for a user
   * @tags relationships, dbtn/module:relationship_management
   * @name get_user_relationships
   * @summary Get User Relationships
   * @request GET:/routes/relationship/get-user-relationships/{user_id}
   */
  export namespace get_user_relationships {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserRelationshipsData;
  }

  /**
   * @description Get details of a specific relationship
   * @tags relationships, dbtn/module:relationship_management
   * @name get_relationship
   * @summary Get Relationship
   * @request GET:/routes/relationship/get-relationship/{relationship_id}
   */
  export namespace get_relationship {
    export type RequestParams = {
      /** Relationship Id */
      relationshipId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetRelationshipData;
  }

  /**
   * @description Create a new relationship between users
   * @tags relationships, dbtn/module:relationship_management
   * @name create_relationship
   * @summary Create Relationship
   * @request POST:/routes/relationship/create-relationship
   */
  export namespace create_relationship {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = Relationship;
    export type RequestHeaders = {};
    export type ResponseBody = CreateRelationshipData;
  }

  /**
   * @description Update the status of a relationship
   * @tags relationships, dbtn/module:relationship_management
   * @name update_relationship_status
   * @summary Update Relationship Status
   * @request PUT:/routes/relationship/update-relationship-status/{relationship_id}
   */
  export namespace update_relationship_status {
    export type RequestParams = {
      /** Relationship Id */
      relationshipId: string;
    };
    export type RequestQuery = {
      status: RelationshipStatus;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateRelationshipStatusData;
  }

  /**
   * @description Calculate relationship strength between two users Factors considered: - Number of successful introductions - Average response time to introduction requests - Quality score based on feedback - Frequency of interactions Returns: StrengthScore with overall score and breakdown
   * @tags relationships, dbtn/module:relationship_management
   * @name get_relationship_strength_v1
   * @summary Get Relationship Strength V1
   * @request GET:/routes/relationship/get-relationship-strength/{user1_id}/{user2_id}
   */
  export namespace get_relationship_strength_v1 {
    export type RequestParams = {
      /** User1 Id */
      user1Id: string;
      /** User2 Id */
      user2Id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetRelationshipStrengthV1Data;
  }

  /**
   * @description Get relationship strength scores for user's entire network Returns: Dict mapping user_ids to strength scores
   * @tags relationships, dbtn/module:relationship_management
   * @name get_network_strength
   * @summary Get Network Strength
   * @request GET:/routes/relationship/get-network-strength/{user_id}
   */
  export namespace get_network_strength {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetNetworkStrengthData;
  }

  /**
   * @description Record a new interaction in a relationship
   * @tags relationships, dbtn/module:relationship_management
   * @name record_interaction
   * @summary Record Interaction
   * @request POST:/routes/relationship/record-interaction/{relationship_id}
   */
  export namespace record_interaction {
    export type RequestParams = {
      /** Relationship Id */
      relationshipId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = Interaction;
    export type RequestHeaders = {};
    export type ResponseBody = RecordInteractionData;
  }

  /**
   * @description Calculate relationship strength between two users Factors considered: - Number of successful introductions - Average response time to introduction requests - Quality score based on feedback - Frequency of interactions Returns: StrengthScore with overall score and breakdown
   * @tags dbtn/module:relationship_strength
   * @name calculate_relationship_strength
   * @summary Calculate Relationship Strength
   * @request GET:/routes/strength/calculate/{user1_id}/{user2_id}
   */
  export namespace calculate_relationship_strength {
    export type RequestParams = {
      /** User1 Id */
      user1Id: string;
      /** User2 Id */
      user2Id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CalculateRelationshipStrengthData;
  }

  /**
   * @description Get relationship strength scores for user's entire network Returns: Dict mapping user_ids to strength scores
   * @tags dbtn/module:relationship_strength
   * @name calculate_network_strength
   * @summary Calculate Network Strength
   * @request GET:/routes/strength/network/{user_id}
   */
  export namespace calculate_network_strength {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CalculateNetworkStrengthData;
  }

  /**
   * @description Upload a file attachment with improved validation and error handling
   * @tags dbtn/module:attachments
   * @name upload_attachment
   * @summary Upload Attachment
   * @request POST:/routes/attachments/upload
   */
  export namespace upload_attachment {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyUploadAttachment;
    export type RequestHeaders = {};
    export type ResponseBody = UploadAttachmentData;
  }

  /**
   * @description Download a file attachment
   * @tags dbtn/module:attachments
   * @name download_attachment
   * @summary Download Attachment
   * @request GET:/routes/attachments/{attachment_id}/download
   */
  export namespace download_attachment {
    export type RequestParams = {
      /** Attachment Id */
      attachmentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = AppApisAuthUtilsTokenRequest;
    export type RequestHeaders = {};
    export type ResponseBody = DownloadAttachmentData;
  }

  /**
   * @description Upload a new document
   * @tags dbtn/module:document_management
   * @name upload_document
   * @summary Upload Document
   * @request POST:/routes/documents/upload
   */
  export namespace upload_document {
    export type RequestParams = {};
    export type RequestQuery = {
      /** User Id */
      user_id?: string | null;
    };
    export type RequestBody = BodyUploadDocument;
    export type RequestHeaders = {};
    export type ResponseBody = UploadDocumentData;
  }

  /**
   * @description Download a document
   * @tags dbtn/module:document_management
   * @name get_document
   * @summary Get Document
   * @request GET:/routes/documents/{document_id}
   */
  export namespace get_document {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {
      /** User Id */
      user_id?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDocumentData;
  }

  /**
   * @description Delete a document
   * @tags dbtn/module:document_management
   * @name delete_document
   * @summary Delete Document
   * @request DELETE:/routes/documents/{document_id}
   */
  export namespace delete_document {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {
      /** User Id */
      user_id?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteDocumentData;
  }

  /**
   * @description Share document with other users
   * @tags dbtn/module:document_management
   * @name share_document
   * @summary Share Document
   * @request POST:/routes/documents/{document_id}/share
   */
  export namespace share_document {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {
      /** User Id */
      user_id?: string;
    };
    export type RequestBody = ShareDocumentPayload;
    export type RequestHeaders = {};
    export type ResponseBody = ShareDocumentData;
  }

  /**
   * @description List all documents accessible to user
   * @tags dbtn/module:document_management
   * @name list_documents
   * @summary List Documents
   * @request GET:/routes/documents
   */
  export namespace list_documents {
    export type RequestParams = {};
    export type RequestQuery = {
      /** User Id */
      user_id?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListDocumentsData;
  }

  /**
   * @description Get a specific version of a document
   * @tags dbtn/module:document_management
   * @name get_document_version
   * @summary Get Document Version
   * @request GET:/routes/documents/{document_id}/versions/{version}
   */
  export namespace get_document_version {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
      /** Version */
      version: number;
    };
    export type RequestQuery = {
      /** User Id */
      user_id?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDocumentVersionData;
  }

  /**
   * @description Get all versions of a document
   * @tags dbtn/module:document_management
   * @name get_document_versions
   * @summary Get Document Versions
   * @request GET:/routes/documents/{document_id}/versions
   */
  export namespace get_document_versions {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {
      /** User Id */
      user_id?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDocumentVersionsData;
  }

  /**
   * @description Restore a document to a previous version
   * @tags dbtn/module:document_management
   * @name restore_document_version
   * @summary Restore Document Version
   * @request POST:/routes/documents/{document_id}/restore/{version}
   */
  export namespace restore_document_version {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
      /** Version */
      version: number;
    };
    export type RequestQuery = {
      /** User Id */
      user_id?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RestoreDocumentVersionData;
  }

  /**
   * @description Get user's storage quota and usage
   * @tags dbtn/module:document_management
   * @name get_quota
   * @summary Get Quota
   * @request GET:/routes/quota
   */
  export namespace get_quota {
    export type RequestParams = {};
    export type RequestQuery = {
      /** User Id */
      user_id?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetQuotaData;
  }

  /**
   * No description
   * @tags dbtn/module:admin
   * @name update_user_role
   * @summary Update User Role
   * @request POST:/routes/admin/users/role
   */
  export namespace update_user_role {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateUserRoleRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateUserRoleData;
  }

  /**
   * No description
   * @tags dbtn/module:admin
   * @name update_user_status
   * @summary Update User Status
   * @request POST:/routes/admin/users/status
   */
  export namespace update_user_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateUserStatusRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateUserStatusData;
  }

  /**
   * No description
   * @tags dbtn/module:admin
   * @name list_admin_users
   * @summary List Admin Users
   * @request POST:/routes/admin/users/list
   */
  export namespace list_admin_users {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ListAdminUsersPayload;
    export type RequestHeaders = {};
    export type ResponseBody = ListAdminUsersData;
  }

  /**
   * No description
   * @tags dbtn/module:admin
   * @name get_admin_role_permissions
   * @summary Get Admin Role Permissions
   * @request GET:/routes/permissions
   */
  export namespace get_admin_role_permissions {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GetAdminRolePermissionsPayload;
    export type RequestHeaders = {};
    export type ResponseBody = GetAdminRolePermissionsData;
  }

  /**
   * @description Get permission structure for roles This endpoint provides role-based permissions data that the frontend uses to determine which features are available to each user role. Returns detailed permission structures for all roles, as well as backward-compatible routes and features dictionaries.
   * @tags routes, dbtn/module:routes
   * @name get_permissions
   * @summary Get Permissions
   * @request POST:/routes/permissions
   */
  export namespace get_permissions {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GetPermissionsPayload;
    export type RequestHeaders = {};
    export type ResponseBody = GetPermissionsData;
  }

  /**
   * No description
   * @tags dbtn/module:admin
   * @name get_admin_audit_logs
   * @summary Get Admin Audit Logs
   * @request GET:/routes/admin/audit-logs
   */
  export namespace get_admin_audit_logs {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Limit
       * @default 100
       */
      limit?: number;
    };
    export type RequestBody = GetAdminAuditLogsPayload;
    export type RequestHeaders = {};
    export type ResponseBody = GetAdminAuditLogsData;
  }

  /**
   * @description Create a new Stripe Connect account This endpoint will: 1. Create a Connect account in Stripe 2. Store the account details locally 3. Generate an onboarding URL if needed 4. Return the account details and onboarding URL
   * @tags dbtn/module:stripe_connect
   * @name create_connect_account
   * @summary Create Connect Account
   * @request POST:/routes/stripe/connect/create-account
   */
  export namespace create_connect_account {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateConnectAccountRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateConnectAccountData;
  }

  /**
   * @description Get a specific Connect account
   * @tags dbtn/module:stripe_connect
   * @name get_connect_account
   * @summary Get Connect Account
   * @request GET:/routes/stripe/connect/account/{account_id}
   */
  export namespace get_connect_account {
    export type RequestParams = {
      /** Account Id */
      accountId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetConnectAccountData;
  }

  /**
   * @description Get all Connect accounts for a user
   * @tags dbtn/module:stripe_connect
   * @name get_user_connect_accounts
   * @summary Get User Connect Accounts
   * @request GET:/routes/stripe/connect/accounts/user/{user_id}
   */
  export namespace get_user_connect_accounts {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserConnectAccountsData;
  }

  /**
   * @description Create a payout to a Connect account This endpoint will: 1. Verify the Connect account exists and is enabled 2. Create a payout in Stripe 3. Return the payout details
   * @tags dbtn/module:stripe_connect
   * @name create_payout
   * @summary Create Payout
   * @request POST:/routes/stripe/connect/payout
   */
  export namespace create_payout {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = PayoutRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreatePayoutData;
  }

  /**
   * @description Import contacts and automatically assign the uploader as lead owner
   * @tags contacts, dbtn/module:contacts
   * @name import_contacts
   * @summary Import Contacts
   * @request POST:/routes/contacts/import
   */
  export namespace import_contacts {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ImportContactsRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ImportContactsData;
  }

  /**
   * No description
   * @tags contacts, dbtn/module:contacts
   * @name list_contacts
   * @summary List Contacts
   * @request GET:/routes/contacts/list
   */
  export namespace list_contacts {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisModelsTokenRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ListContactsData;
  }

  /**
   * No description
   * @tags contacts, dbtn/module:contacts
   * @name get_contact_matches
   * @summary Get Contact Matches
   * @request POST:/routes/contact-matches
   */
  export namespace get_contact_matches {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisModelsTokenRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GetContactMatchesData;
  }

  /**
   * @description Request an introduction to a contact
   * @tags contacts, dbtn/module:contacts
   * @name request_introduction
   * @summary Request Introduction
   * @request POST:/routes/request-introduction
   */
  export namespace request_introduction {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisContactsIntroductionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RequestIntroductionData;
  }

  /**
   * @description Transfer ownership of a contact to another user
   * @tags contacts, dbtn/module:contacts
   * @name transfer_ownership
   * @summary Transfer Ownership
   * @request POST:/routes/contacts/transfer-ownership
   */
  export namespace transfer_ownership {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TransferOwnershipRequest;
    export type RequestHeaders = {};
    export type ResponseBody = TransferOwnershipData;
  }

  /**
   * No description
   * @tags dbtn/module:profile
   * @name create_profile
   * @summary Create Profile
   * @request POST:/routes/profile/create-profile
   */
  export namespace create_profile {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateProfileRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateProfileData;
  }

  /**
   * @description Upload a profile image with validation - Validates file type (must be image) - Validates file size (max 5MB) - Stores image securely - Returns public URL for the image
   * @tags dbtn/module:profile
   * @name upload_profile_image
   * @summary Upload Profile Image
   * @request POST:/routes/profile/upload-image
   */
  export namespace upload_profile_image {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyUploadProfileImage;
    export type RequestHeaders = {};
    export type ResponseBody = UploadProfileImageData;
  }

  /**
   * No description
   * @tags dbtn/module:profile
   * @name get_profile_v1
   * @summary Get Profile V1
   * @request GET:/routes/profile/get/{user_id}
   */
  export namespace get_profile_v1 {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {
      /** Viewer Role */
      viewer_role?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetProfileV1Data;
  }

  /**
   * No description
   * @tags dbtn/module:profile
   * @name list_profiles_v1
   * @summary List Profiles V1
   * @request POST:/routes/profile/list
   */
  export namespace list_profiles_v1 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ListProfilesRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ListProfilesV1Data;
  }

  /**
   * @description Store a profile in storage
   * @tags dbtn/module:storage
   * @name store_profile_endpoint
   * @summary Store Profile Endpoint
   * @request POST:/routes/storage/profiles/{user_id}
   */
  export namespace store_profile_endpoint {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = StoreProfileEndpointPayload;
    export type RequestHeaders = {};
    export type ResponseBody = StoreProfileEndpointData;
  }

  /**
   * @description Get a profile from storage
   * @tags dbtn/module:storage
   * @name get_profile_endpoint
   * @summary Get Profile Endpoint
   * @request GET:/routes/storage/profiles/{user_id}
   */
  export namespace get_profile_endpoint {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {
      /** Viewer Role */
      viewer_role?: UserType | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetProfileEndpointData;
  }

  /**
   * @description Update a profile in storage
   * @tags dbtn/module:storage
   * @name update_profile_endpoint
   * @summary Update Profile Endpoint
   * @request PUT:/routes/storage/profiles/{user_id}
   */
  export namespace update_profile_endpoint {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateProfileEndpointPayload;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateProfileEndpointData;
  }

  /**
   * No description
   * @tags dbtn/module:permissions
   * @name update_role_permissions
   * @summary Update Role Permissions
   * @request POST:/routes/update
   */
  export namespace update_role_permissions {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateRolePermissionsRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateRolePermissionsData;
  }

  /**
   * No description
   * @tags dbtn/module:permissions
   * @name get_role_permissions
   * @summary Get Role Permissions
   * @request GET:/routes/list
   */
  export namespace get_role_permissions {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisModelsTokenRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GetRolePermissionsData;
  }

  /**
   * @description Estimate the size of the exported data
   * @tags data-export, dbtn/module:data_export
   * @name estimate_export_size
   * @summary Estimate Export Size
   * @request POST:/routes/estimate-size
   */
  export namespace estimate_export_size {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = EstimateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = EstimateExportSizeData;
  }

  /**
   * @description Export user data in the specified format
   * @tags data-export, dbtn/module:data_export
   * @name export_user_data
   * @summary Export User Data
   * @request POST:/routes/export-data
   */
  export namespace export_user_data {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ExportRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ExportUserDataData;
  }

  /**
   * @description Get the progress of an export
   * @tags data-export, dbtn/module:data_export
   * @name get_export_progress
   * @summary Get Export Progress
   * @request GET:/routes/export-progress/{export_id}
   */
  export namespace get_export_progress {
    export type RequestParams = {
      /** Export Id */
      exportId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetExportProgressData;
  }

  /**
   * @description Download an exported data file
   * @tags data-export, dbtn/module:data_export
   * @name download_export
   * @summary Download Export
   * @request GET:/routes/download/{export_id}
   */
  export namespace download_export {
    export type RequestParams = {
      /** Export Id */
      exportId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DownloadExportData;
  }

  /**
   * @description Request a refund for a subscription payment
   * @tags dbtn/module:subscription_refunds
   * @name request_refund
   * @summary Request Refund
   * @request POST:/routes/request-refund
   */
  export namespace request_refund {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RefundRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RequestRefundData;
  }

  /**
   * @description Cancel a subscription with optional immediate cancellation
   * @tags dbtn/module:subscription_refunds
   * @name cancel_subscription
   * @summary Cancel Subscription
   * @request POST:/routes/cancel-subscription
   */
  export namespace cancel_subscription {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CancellationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CancelSubscriptionData;
  }

  /**
   * @description Get the status of a refund request
   * @tags dbtn/module:subscription_refunds
   * @name get_refund_status
   * @summary Get Refund Status
   * @request GET:/routes/refund-status/{refund_id}
   */
  export namespace get_refund_status {
    export type RequestParams = {
      /** Refund Id */
      refundId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetRefundStatusData;
  }

  /**
   * @description Get the status of a cancellation request
   * @tags dbtn/module:subscription_refunds
   * @name get_cancellation_status
   * @summary Get Cancellation Status
   * @request GET:/routes/cancellation-status/{cancellation_id}
   */
  export namespace get_cancellation_status {
    export type RequestParams = {
      /** Cancellation Id */
      cancellationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCancellationStatusData;
  }

  /**
   * @description Health check endpoint.
   * @tags utils, dbtn/module:utils
   * @name health_check
   * @summary Health Check
   * @request GET:/routes/utils/health
   */
  export namespace health_check {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = HealthCheckData;
  }

  /**
   * @description Get all available enums for the frontend.
   * @tags utils, dbtn/module:utils
   * @name get_enums
   * @summary Get Enums
   * @request GET:/routes/utils/enums
   */
  export namespace get_enums {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetEnumsData;
  }

  /**
   * @description Get storage statistics.
   * @tags utils, dbtn/module:utils
   * @name get_storage_stats
   * @summary Get Storage Stats
   * @request GET:/routes/utils/storage-stats
   */
  export namespace get_storage_stats {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetStorageStatsData;
  }

  /**
   * @description Get moderation effectiveness metrics
   * @tags moderation, dbtn/module:moderation
   * @name get_moderation_metrics_v1
   * @summary Get Moderation Metrics V1
   * @request GET:/routes/metrics/v1
   */
  export namespace get_moderation_metrics_v1 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisModelsTokenRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GetModerationMetricsV1Data;
  }

  /**
   * No description
   * @tags moderation, dbtn/module:moderation
   * @name get_content_reports_v1
   * @summary Get Content Reports V1
   * @request GET:/routes/moderation/reports/v1
   */
  export namespace get_content_reports_v1 {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Status */
      status?: AppApisModelsReportStatus | null;
    };
    export type RequestBody = GetContentReportsV1Payload;
    export type RequestHeaders = {};
    export type ResponseBody = GetContentReportsV1Data;
  }

  /**
   * No description
   * @tags moderation, dbtn/module:moderation
   * @name get_content_rules_v1
   * @summary Get Content Rules V1
   * @request GET:/routes/moderation/rules/v1
   */
  export namespace get_content_rules_v1 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GetContentRulesV1Payload;
    export type RequestHeaders = {};
    export type ResponseBody = GetContentRulesV1Data;
  }

  /**
   * No description
   * @tags moderation, dbtn/module:moderation
   * @name test_pattern_v1
   * @summary Test Pattern V1
   * @request POST:/routes/moderation/rules/test/v1
   */
  export namespace test_pattern_v1 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisModelsPatternTestRequest;
    export type RequestHeaders = {};
    export type ResponseBody = TestPatternV1Data;
  }

  /**
   * No description
   * @tags moderation, dbtn/module:moderation
   * @name add_content_rule_v1
   * @summary Add Content Rule V1
   * @request POST:/routes/moderation/rules/add/v1
   */
  export namespace add_content_rule_v1 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisModerationAddContentRuleRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AddContentRuleV1Data;
  }

  /**
   * No description
   * @tags moderation, dbtn/module:moderation
   * @name batch_update_rules_v1
   * @summary Batch Update Rules V1
   * @request POST:/routes/moderation/rules/batch/v1
   */
  export namespace batch_update_rules_v1 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BatchOperationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = BatchUpdateRulesV1Data;
  }

  /**
   * No description
   * @tags moderation, dbtn/module:moderation
   * @name get_rule_effectiveness_v1
   * @summary Get Rule Effectiveness V1
   * @request GET:/routes/moderation/rules/effectiveness/v1
   */
  export namespace get_rule_effectiveness_v1 {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Rule Id */
      rule_id?: string | null;
    };
    export type RequestBody = GetRuleEffectivenessV1Payload;
    export type RequestHeaders = {};
    export type ResponseBody = GetRuleEffectivenessV1Data;
  }

  /**
   * No description
   * @tags moderation, dbtn/module:moderation
   * @name update_content_rule_v1
   * @summary Update Content Rule V1
   * @request POST:/routes/moderation/rules/{rule_id}/update/v1
   */
  export namespace update_content_rule_v1 {
    export type RequestParams = {
      /** Rule Id */
      ruleId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = BodyUpdateContentRuleV1;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateContentRuleV1Data;
  }

  /**
   * No description
   * @tags moderation, dbtn/module:moderation
   * @name get_moderation_actions_v1
   * @summary Get Moderation Actions V1
   * @request GET:/routes/moderation/actions/v1
   */
  export namespace get_moderation_actions_v1 {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Report Id */
      report_id?: string | null;
    };
    export type RequestBody = GetModerationActionsV1Payload;
    export type RequestHeaders = {};
    export type ResponseBody = GetModerationActionsV1Data;
  }

  /**
   * No description
   * @tags moderation, dbtn/module:moderation
   * @name update_report_status_v1
   * @summary Update Report Status V1
   * @request POST:/routes/moderation/reports/update/v1
   */
  export namespace update_report_status_v1 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateReportRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateReportStatusV1Data;
  }

  /**
   * @description Get visibility settings for a user
   * @tags dbtn/module:profile_visibility
   * @name get_visibility_settings
   * @summary Get Visibility Settings
   * @request GET:/routes/profile/visibility/{user_id}
   */
  export namespace get_visibility_settings {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetVisibilitySettingsData;
  }

  /**
   * @description Update visibility settings for a user
   * @tags dbtn/module:profile_visibility
   * @name update_visibility_settings
   * @summary Update Visibility Settings
   * @request POST:/routes/profile/visibility/update
   */
  export namespace update_visibility_settings {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateVisibilityRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateVisibilitySettingsData;
  }

  /**
   * @description Get all available subscription plans
   * @tags dbtn/module:subscription
   * @name get_subscription_plans
   * @summary Get Subscription Plans
   * @request GET:/routes/subscription-plans
   */
  export namespace get_subscription_plans {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSubscriptionPlansData;
  }

  /**
   * @description Start a free trial subscription using a trial code
   * @tags dbtn/module:subscription
   * @name start_trial
   * @summary Start Trial
   * @request POST:/routes/start-trial
   */
  export namespace start_trial {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = StartTrialRequest;
    export type RequestHeaders = {};
    export type ResponseBody = StartTrialData;
  }

  /**
   * @description Get all subscription features and their access levels
   * @tags dbtn/module:subscription
   * @name get_subscription_features
   * @summary Get Subscription Features
   * @request GET:/routes/subscription-features
   */
  export namespace get_subscription_features {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSubscriptionFeaturesData;
  }

  /**
   * @description Get subscription details for a user
   * @tags dbtn/module:subscription
   * @name get_user_subscription
   * @summary Get User Subscription
   * @request GET:/routes/user-subscription/{user_id}
   */
  export namespace get_user_subscription {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserSubscriptionData;
  }

  /**
   * @description Add a new payment method for a user
   * @tags dbtn/module:subscription
   * @name add_payment_method
   * @summary Add Payment Method
   * @request POST:/routes/payment-methods/{user_id}
   */
  export namespace add_payment_method {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {
      /** Payment Type */
      payment_type: string;
      /** Last Four */
      last_four: string;
      /** Expiry Date */
      expiry_date?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = AddPaymentMethodData;
  }

  /**
   * @description Get all payment methods for a user
   * @tags dbtn/module:subscription
   * @name get_payment_methods
   * @summary Get Payment Methods
   * @request GET:/routes/payment-methods/{user_id}
   */
  export namespace get_payment_methods {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPaymentMethodsData;
  }

  /**
   * @description Update a user's subscription using Stripe for payment processing
   * @tags dbtn/module:subscription
   * @name update_subscription
   * @summary Update Subscription
   * @request POST:/routes/subscriptions/{user_id}/update
   */
  export namespace update_subscription {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = SubscriptionUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateSubscriptionData;
  }

  /**
   * @description Get payment transaction history for a user
   * @tags dbtn/module:subscription
   * @name get_transactions
   * @summary Get Transactions
   * @request GET:/routes/transactions/{user_id}
   */
  export namespace get_transactions {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetTransactionsData;
  }

  /**
   * @description Get invoice history for a user
   * @tags dbtn/module:subscription
   * @name get_invoices
   * @summary Get Invoices
   * @request GET:/routes/invoices/{user_id}
   */
  export namespace get_invoices {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetInvoicesData;
  }

  /**
   * @description List all trial codes (admin only)
   * @tags dbtn/module:subscription
   * @name list_trial_codes
   * @summary List Trial Codes
   * @request GET:/routes/admin/trial-codes
   */
  export namespace list_trial_codes {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListTrialCodesData;
  }

  /**
   * @description Create a new trial code (admin only)
   * @tags dbtn/module:subscription
   * @name create_trial_code
   * @summary Create Trial Code
   * @request POST:/routes/admin/trial-codes
   */
  export namespace create_trial_code {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateTrialCodeRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateTrialCodeData;
  }

  /**
   * @description Deactivate a trial code (admin only)
   * @tags dbtn/module:subscription
   * @name deactivate_trial_code
   * @summary Deactivate Trial Code
   * @request PUT:/routes/admin/trial-codes/{code}/deactivate
   */
  export namespace deactivate_trial_code {
    export type RequestParams = {
      /** Code */
      code: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeactivateTrialCodeData;
  }

  /**
   * @description Check if a user has access to a specific feature
   * @tags dbtn/module:subscription
   * @name get_feature_access
   * @summary Get Feature Access
   * @request GET:/routes/check-feature-access/{user_id}/{feature_name}
   */
  export namespace get_feature_access {
    export type RequestParams = {
      /** User Id */
      userId: string;
      /** Feature Name */
      featureName: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetFeatureAccessData;
  }

  /**
   * @description Get analytics for fund managers
   * @tags analytics, dbtn/module:analytics
   * @name get_fund_manager_analytics
   * @summary Get Fund Manager Analytics
   * @request GET:/routes/analytics/fund-manager/{user_id}
   */
  export namespace get_fund_manager_analytics {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetFundManagerAnalyticsData;
  }

  /**
   * @description Get analytics for limited partners
   * @tags analytics, dbtn/module:analytics
   * @name get_lp_analytics
   * @summary Get Lp Analytics
   * @request GET:/routes/analytics/limited-partner/{user_id}
   */
  export namespace get_lp_analytics {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetLpAnalyticsData;
  }

  /**
   * @description Get analytics for capital raisers
   * @tags analytics, dbtn/module:analytics
   * @name get_capital_raiser_analytics
   * @summary Get Capital Raiser Analytics
   * @request GET:/routes/analytics/capital-raiser/{user_id}
   */
  export namespace get_capital_raiser_analytics {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCapitalRaiserAnalyticsData;
  }

  /**
   * @description Get platform-wide analytics for admins Function renamed to avoid duplicate operation ID with admin_analytics module.
   * @tags analytics, dbtn/module:analytics
   * @name get_admin_analytics2
   * @summary Get Admin Analytics2
   * @request GET:/routes/analytics/admin
   */
  export namespace get_admin_analytics2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAdminAnalytics2Data;
  }

  /**
   * @description Health check endpoint for the models API router Function renamed to avoid duplicate operation ID with other health check endpoints.
   * @tags dbtn/module:router
   * @name check_health_router
   * @summary Check Health Router
   * @request GET:/routes/api-health
   */
  export namespace check_health_router {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthRouterData;
  }

  /**
   * @description Get the admin analytics dashboard This endpoint matches the exact path expected by the frontend. This is a synchronous implementation that directly generates dashboard data. Function renamed to avoid duplicate operation ID with admin_analytics module. Returns: AdminDashboard containing platform-wide analytics data
   * @tags routes, dbtn/module:routes
   * @name route_admin_analytics_dashboard_endpoint
   * @summary Route Admin Analytics Dashboard Endpoint
   * @request GET:/routes/admin/analytics/dashboard
   */
  export namespace route_admin_analytics_dashboard_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RouteAdminAnalyticsDashboardEndpointData;
  }

  /**
   * @description Get content reports, matching the frontend path expectations Uses lazy imports to avoid circular dependencies.
   * @tags content, dbtn/module:content
   * @name get_content_reports_wrapper
   * @summary Get Content Reports Wrapper
   * @request GET:/routes/content/reports
   */
  export namespace get_content_reports_wrapper {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Status */
      status?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetContentReportsWrapperData;
  }

  /**
   * @description Get content rules, matching the frontend path expectations Uses lazy imports to avoid circular dependencies.
   * @tags content, dbtn/module:content
   * @name get_content_rules_wrapper
   * @summary Get Content Rules Wrapper
   * @request GET:/routes/content/rules
   */
  export namespace get_content_rules_wrapper {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetContentRulesWrapperData;
  }

  /**
   * @description Get content reports, matching the frontend path expectations Uses lazy imports to avoid circular dependencies.
   * @tags content, dbtn/module:content_v2
   * @name get_content_reports_v2
   * @summary Get Content Reports V2
   * @request GET:/routes/content_v2/reports
   */
  export namespace get_content_reports_v2 {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Status */
      status?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetContentReportsV2Data;
  }

  /**
   * @description Get content rules, matching the frontend path expectations Uses lazy imports to avoid circular dependencies.
   * @tags content, dbtn/module:content_v2
   * @name get_content_rules_v2
   * @summary Get Content Rules V2
   * @request GET:/routes/content_v2/rules
   */
  export namespace get_content_rules_v2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetContentRulesV2Data;
  }

  /**
   * @description Get platform-wide analytics for admins using the path-based route This endpoint matches the exact path expected by direct API calls. Returns: AdminAnalytics containing platform-wide analytics data
   * @tags admin, dbtn/module:admin_analytics
   * @name get_admin_analytics_by_path
   * @summary Get Admin Analytics By Path
   * @request GET:/routes/routes/analytics/admin
   */
  export namespace get_admin_analytics_by_path {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAdminAnalyticsByPathData;
  }

  /**
   * @description Get platform-wide analytics dashboard for admins This endpoint matches the exact path the frontend is trying to access. This is a synchronous version that wraps the async get_admin_dashboard() function. Returns: AdminDashboard containing platform-wide analytics data
   * @tags admin, dbtn/module:admin_analytics
   * @name get_admin_analytics_dashboard
   * @summary Get Admin Analytics Dashboard
   * @request GET:/routes/routes/admin/analytics/dashboard
   */
  export namespace get_admin_analytics_dashboard {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAdminAnalyticsDashboardData;
  }

  /**
   * @description Get platform-wide analytics for admins This endpoint matches the exact function name expected by the Brain client. Function renamed to avoid duplicate operation ID. Returns: AdminAnalytics containing platform-wide analytics data
   * @tags admin, dbtn/module:admin_analytics
   * @name get_admin_analytics_endpoint
   * @summary Get Admin Analytics Endpoint
   * @request GET:/routes/get-admin-analytics
   */
  export namespace get_admin_analytics_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAdminAnalyticsEndpointData;
  }

  /**
   * @description Root endpoint for getting admin analytics This endpoint is needed for direct brain.get_admin_analytics() calls from the frontend. Returns: AdminAnalytics containing platform-wide analytics data
   * @tags admin, dbtn/module:admin_analytics
   * @name get_admin_analytics_root
   * @summary Get Admin Analytics Root
   * @request GET:/routes/
   */
  export namespace get_admin_analytics_root {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAdminAnalyticsRootData;
  }

  /**
   * @description Get the complete admin dashboard This endpoint aggregates data from all parts of the platform to provide a comprehensive view for administrators. Returns: AdminDashboard containing all metrics and recent activities
   * @tags admin, dbtn/module:admin_analytics
   * @name get_admin_dashboard
   * @summary Get Admin Dashboard
   * @request GET:/routes/dashboard
   */
  export namespace get_admin_dashboard {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAdminDashboardData;
  }

  /**
   * @description Get detailed analytics for a specific user type Args: role: The user role to get analytics for Returns: UserTypeMetrics for the specified role
   * @tags admin, dbtn/module:admin_analytics
   * @name get_user_type_analytics
   * @summary Get User Type Analytics
   * @request GET:/routes/user-type/{role}
   */
  export namespace get_user_type_analytics {
    export type RequestParams = {
      role: UserType;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserTypeAnalyticsData;
  }

  /**
   * @description Get detailed matching analytics Returns: MatchingMetrics containing platform-wide matching data
   * @tags admin, dbtn/module:admin_analytics
   * @name get_matching_analytics
   * @summary Get Matching Analytics
   * @request GET:/routes/matching
   */
  export namespace get_matching_analytics {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetMatchingAnalyticsData;
  }

  /**
   * @description Get detailed fundraising analytics Returns: FundraisingMetrics containing platform-wide fundraising data
   * @tags admin, dbtn/module:admin_analytics
   * @name get_fundraising_analytics
   * @summary Get Fundraising Analytics
   * @request GET:/routes/fundraising
   */
  export namespace get_fundraising_analytics {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetFundraisingAnalyticsData;
  }

  /**
   * @description Get verification system settings
   * @tags verification_settings, dbtn/module:settings
   * @name get_verification_settings
   * @summary Get Verification Settings
   * @request GET:/routes/verification-settings/
   */
  export namespace get_verification_settings {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetVerificationSettingsData;
  }

  /**
   * @description Update verification system settings
   * @tags verification_settings, dbtn/module:settings
   * @name update_verification_settings
   * @summary Update Verification Settings
   * @request POST:/routes/verification-settings/
   */
  export namespace update_verification_settings {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisSettingsVerificationSettings;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateVerificationSettingsData;
  }

  /**
   * @description Create a new user profile with role-specific validation This endpoint handles: 1. Profile data validation based on user role 2. Duplicate profile prevention 3. Default privacy settings 4. Timestamp management 5. Storage of validated profiles
   * @tags profiles, dbtn/module:profile_management
   * @name create_profile_v2
   * @summary Create Profile V2
   * @request POST:/routes/profile/management/create-profile
   */
  export namespace create_profile_v2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateProfileRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateProfileV2Data;
  }

  /**
   * @description Get a user's profile with privacy controls Args: user_id: The ID of the user whose profile to retrieve viewer_role: Optional role of the user viewing the profile, used for privacy filtering Returns: Dict containing the filtered profile data based on privacy settings Raises: HTTPException: If profile not found or access denied
   * @tags profiles, dbtn/module:profile_management
   * @name get_profile_v2
   * @summary Get Profile V2
   * @request GET:/routes/profile/management/get-profile/{user_id}
   */
  export namespace get_profile_v2 {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {
      /** Viewer Role */
      viewer_role?: UserType | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetProfileV2Data;
  }

  /**
   * @description Update a user's profile This endpoint handles: 1. Partial updates to profile data 2. Validation of updated fields 3. Timestamp management 4. Storage of updated profile 5. Automatic verification status update based on profile completeness Args: user_id: The ID of the user whose profile to update updates: Dictionary containing the fields to update Returns: ProfileResponse with status and profile ID Raises: HTTPException: If profile not found or validation fails
   * @tags profiles, dbtn/module:profile_management
   * @name update_profile_management
   * @summary Update Profile Management
   * @request PUT:/routes/profile/management/update-profile/{user_id}
   */
  export namespace update_profile_management {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateProfileManagementPayload;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateProfileManagementData;
  }

  /**
   * @description Update profile visibility settings This endpoint handles: 1. Validation of visibility settings 2. Profile existence check 3. Update of privacy controls 4. Timestamp management Args: user_id: The ID of the user whose visibility settings to update visibility: New visibility settings to apply Returns: ProfileResponse with status and profile ID Raises: HTTPException: If profile not found or validation fails
   * @tags profiles, dbtn/module:profile_management
   * @name update_visibility_management
   * @summary Update Visibility Management
   * @request PUT:/routes/profile/management/update-visibility/{user_id}
   */
  export namespace update_visibility_management {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ProfileVisibility;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateVisibilityManagementData;
  }

  /**
   * @description List all profiles with optional filtering and pagination This endpoint handles: 1. Optional filtering by user type 2. Optional filtering for verified profiles only 3. Pagination of results 4. Privacy-aware profile listing Args: user_type: Optional filter for specific user types verified_only: If True, only return verified profiles page: Page number for pagination (1-based) page_size: Number of profiles per page Returns: ProfileListResponse containing paginated profiles and metadata Raises: HTTPException: If listing operation fails
   * @tags profiles, dbtn/module:profile_management
   * @name list_profiles_v2
   * @summary List Profiles V2
   * @request GET:/routes/profile/management/list-profiles
   */
  export namespace list_profiles_v2 {
    export type RequestParams = {};
    export type RequestQuery = {
      /** User Type */
      user_type?: UserType | null;
      /**
       * Verified Only
       * @default false
       */
      verified_only?: boolean;
      /**
       * Page
       * @default 1
       */
      page?: number;
      /**
       * Page Size
       * @default 10
       */
      page_size?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListProfilesV2Data;
  }

  /**
   * @description Submit a document for verification
   * @tags dbtn/module:verification
   * @name submit_verification
   * @summary Submit Verification
   * @request POST:/routes/submit-verification
   */
  export namespace submit_verification {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = VerificationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SubmitVerificationData;
  }

  /**
   * @description Get verification status for a user with both document status and profile completion
   * @tags dbtn/module:verification
   * @name get_verification_status
   * @summary Get Verification Status
   * @request GET:/routes/verification-status/{user_id}
   */
  export namespace get_verification_status {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetVerificationStatusData;
  }

  /**
   * @description Review a verification document
   * @tags dbtn/module:verification
   * @name review_document
   * @summary Review Document
   * @request POST:/routes/review-document
   */
  export namespace review_document {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ReviewRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ReviewDocumentData;
  }

  /**
   * @description Get all pending verification documents
   * @tags dbtn/module:verification
   * @name get_pending_verifications
   * @summary Get Pending Verifications
   * @request GET:/routes/pending-verifications
   */
  export namespace get_pending_verifications {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPendingVerificationsData;
  }

  /**
   * @description Upload a document for verification with flexible requirements based on settings This endpoint will check verification settings to determine if document verification is required or if profile completeness is sufficient for verification.
   * @tags dbtn/module:verification
   * @name upload_verification_document
   * @summary Upload Verification Document
   * @request POST:/routes/upload-verification-document
   */
  export namespace upload_verification_document {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyUploadVerificationDocument;
    export type RequestHeaders = {};
    export type ResponseBody = UploadVerificationDocumentData;
  }

  /**
   * @description Download a verification document by ID
   * @tags dbtn/module:verification
   * @name download_document
   * @summary Download Document
   * @request GET:/routes/download-document/{document_id}
   */
  export namespace download_document {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DownloadDocumentData;
  }

  /**
   * @description Test a pattern against content
   * @tags moderation, dbtn/module:content_rules
   * @name test_pattern
   * @summary Test Pattern
   * @request POST:/routes/test-pattern
   */
  export namespace test_pattern {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisContentRulesPatternTestRequest;
    export type RequestHeaders = {};
    export type ResponseBody = TestPatternData;
  }

  /**
   * @description Get moderation settings
   * @tags dbtn/module:moderation_settings
   * @name get_moderation_settings_v1
   * @summary Get Moderation Settings V1
   * @request GET:/routes/moderation-settings
   */
  export namespace get_moderation_settings_v1 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetModerationSettingsV1Data;
  }

  /**
   * @description Update moderation settings
   * @tags dbtn/module:moderation_settings
   * @name update_moderation_settings_v1
   * @summary Update Moderation Settings V1
   * @request POST:/routes/moderation-settings
   */
  export namespace update_moderation_settings_v1 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisModerationSettingsModerationSettings;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateModerationSettingsV1Data;
  }

  /**
   * @description Get content moderation rules
   * @tags dbtn/module:moderation_settings
   * @name get_content_rules_v12
   * @summary Get Content Rules V1
   * @request GET:/routes/content-rules
   * @originalName get_content_rules_v1
   * @duplicate
   */
  export namespace get_content_rules_v12 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetContentRulesV12Data;
  }

  /**
   * @description Update content moderation rules
   * @tags dbtn/module:moderation_settings
   * @name update_content_rules_v1
   * @summary Update Content Rules V1
   * @request POST:/routes/content-rules
   */
  export namespace update_content_rules_v1 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateContentRulesV1Payload;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateContentRulesV1Data;
  }

  /**
   * @description Get verification system settings
   * @tags dbtn/module:verification_settings
   * @name get_verification_config
   * @summary Get Verification Config
   * @request GET:/routes/verification-config/
   */
  export namespace get_verification_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetVerificationConfigData;
  }

  /**
   * @description Update verification system settings
   * @tags dbtn/module:verification_settings
   * @name update_verification_config
   * @summary Update Verification Config
   * @request POST:/routes/verification-config/
   */
  export namespace update_verification_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisVerificationSettingsVerificationSettings;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateVerificationConfigData;
  }

  /**
   * @description Get moderation system settings
   * @tags dbtn/module:verification_settings
   * @name get_moderation_settings
   * @summary Get Moderation Settings
   * @request GET:/routes/moderation/
   */
  export namespace get_moderation_settings {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetModerationSettingsData;
  }

  /**
   * @description Update moderation system settings
   * @tags dbtn/module:verification_settings
   * @name update_moderation_settings
   * @summary Update Moderation Settings
   * @request POST:/routes/moderation/
   */
  export namespace update_moderation_settings {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisVerificationSettingsModerationSettings;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateModerationSettingsData;
  }

  /**
   * @description Get content moderation rules
   * @tags dbtn/module:verification_settings
   * @name get_content_rules
   * @summary Get Content Rules
   * @request GET:/routes/content-rules/
   */
  export namespace get_content_rules {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetContentRulesData;
  }

  /**
   * @description Update content moderation rules
   * @tags dbtn/module:verification_settings
   * @name update_content_rules
   * @summary Update Content Rules
   * @request POST:/routes/content-rules/
   */
  export namespace update_content_rules {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateContentRulesPayload;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateContentRulesData;
  }

  /**
   * @description Test moderation pattern against content
   * @tags dbtn/module:verification_settings
   * @name test_moderation_pattern
   * @summary Test Moderation Pattern
   * @request POST:/routes/test-pattern/
   */
  export namespace test_moderation_pattern {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisVerificationSettingsPatternTestRequest;
    export type RequestHeaders = {};
    export type ResponseBody = TestModerationPatternData;
  }

  /**
   * @description GET version of the metrics endpoint for frontend compatibility
   * @tags moderation, dbtn/module:content_rules
   * @name get_moderation_metrics2_get
   * @summary Get Moderation Metrics2 Get
   * @request GET:/routes/metrics2
   */
  export namespace get_moderation_metrics2_get {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetModerationMetrics2GetData;
  }

  /**
   * @description Get comprehensive moderation metrics - version 2 endpoint to match frontend
   * @tags moderation, dbtn/module:content_rules
   * @name get_moderation_metrics2
   * @summary Get Moderation Metrics2
   * @request POST:/routes/metrics2
   */
  export namespace get_moderation_metrics2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GetModerationMetrics2Payload;
    export type RequestHeaders = {};
    export type ResponseBody = GetModerationMetrics2Data;
  }

  /**
   * @description Get statistics about moderation actions - version 2 endpoint to match frontend
   * @tags moderation, dbtn/module:content_rules
   * @name get_moderation_actions2
   * @summary Get Moderation Actions2
   * @request POST:/routes/moderation-actions2
   */
  export namespace get_moderation_actions2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GetModerationActions2Payload;
    export type RequestHeaders = {};
    export type ResponseBody = GetModerationActions2Data;
  }

  /**
   * @description Test a pattern against content - version 2 endpoint to match frontend
   * @tags moderation, dbtn/module:content_rules
   * @name test_pattern2
   * @summary Test Pattern2
   * @request POST:/routes/test-pattern2
   */
  export namespace test_pattern2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisContentRulesPatternTestRequest;
    export type RequestHeaders = {};
    export type ResponseBody = TestPattern2Data;
  }

  /**
   * @description Get all content moderation rules - version 2 endpoint to match frontend
   * @tags moderation, dbtn/module:content_rules
   * @name get_content_rules2
   * @summary Get Content Rules2
   * @request POST:/routes/content-rules2
   */
  export namespace get_content_rules2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GetContentRules2Payload;
    export type RequestHeaders = {};
    export type ResponseBody = GetContentRules2Data;
  }

  /**
   * @description Get content reports, optionally filtered by status - version 2 endpoint to match frontend
   * @tags moderation, dbtn/module:content_rules
   * @name get_content_reports2
   * @summary Get Content Reports2
   * @request POST:/routes/content-reports2
   */
  export namespace get_content_reports2 {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Status */
      status?: string | null;
    };
    export type RequestBody = GetContentReports2Payload;
    export type RequestHeaders = {};
    export type ResponseBody = GetContentReports2Data;
  }

  /**
   * @description Update the status of a content report - version 2 endpoint to match frontend
   * @tags moderation, dbtn/module:content_rules
   * @name update_report_status2
   * @summary Update Report Status2
   * @request POST:/routes/update-report-status2
   */
  export namespace update_report_status2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateReportStatusRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateReportStatus2Data;
  }

  /**
   * @description Get all content moderation rules Function renamed to avoid duplicate operation ID with content module.
   * @tags moderation, dbtn/module:content_rules
   * @name get_content_rules_v12
   * @summary Get Content Rules V12
   * @request POST:/routes/rules/get
   */
  export namespace get_content_rules_v12 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetContentRulesV12Result;
  }

  /**
   * @description Add a new content moderation rule
   * @tags moderation, dbtn/module:content_rules
   * @name add_content_rule
   * @summary Add Content Rule
   * @request POST:/routes/rules/add
   */
  export namespace add_content_rule {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisContentRulesAddContentRuleRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AddContentRuleData;
  }

  /**
   * @description Get content reports, optionally filtered by status Function renamed to avoid duplicate operation ID with content module.
   * @tags moderation, dbtn/module:content_rules
   * @name get_content_reports_v12
   * @summary Get Content Reports V12
   * @request POST:/routes/reports
   */
  export namespace get_content_reports_v12 {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Status */
      status?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetContentReportsV12Data;
  }

  /**
   * @description Update the status of a content report
   * @tags moderation, dbtn/module:content_rules
   * @name update_report_status
   * @summary Update Report Status
   * @request POST:/routes/reports/{report_id}/status
   */
  export namespace update_report_status {
    export type RequestParams = {
      /** Report Id */
      reportId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateReportStatusRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateReportStatusData;
  }

  /**
   * @description Get effectiveness metrics for content rules
   * @tags moderation, dbtn/module:content_rules
   * @name get_rule_effectiveness
   * @summary Get Rule Effectiveness
   * @request GET:/routes/effectiveness
   */
  export namespace get_rule_effectiveness {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Rule Id */
      rule_id?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetRuleEffectivenessData;
  }

  /**
   * @description Batch update content rules
   * @tags moderation, dbtn/module:content_rules
   * @name batch_update_rules
   * @summary Batch Update Rules
   * @request POST:/routes/batch-update
   */
  export namespace batch_update_rules {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BatchUpdateRulesPayload;
    export type RequestHeaders = {};
    export type ResponseBody = BatchUpdateRulesData;
  }

  /**
   * @description Update a content rule
   * @tags moderation, dbtn/module:content_rules
   * @name update_content_rule
   * @summary Update Content Rule
   * @request PUT:/routes/rules/{rule_id}
   */
  export namespace update_content_rule {
    export type RequestParams = {
      /** Rule Id */
      ruleId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateContentRulePayload;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateContentRuleData;
  }

  /**
   * @description Get statistics about moderation actions
   * @tags moderation, dbtn/module:content_rules
   * @name get_moderation_actions
   * @summary Get Moderation Actions
   * @request POST:/routes/moderation-actions
   */
  export namespace get_moderation_actions {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetModerationActionsData;
  }

  /**
   * @description Get comprehensive moderation metrics
   * @tags moderation, dbtn/module:content_rules
   * @name get_moderation_metrics
   * @summary Get Moderation Metrics
   * @request POST:/routes/metrics
   */
  export namespace get_moderation_metrics {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetModerationMetricsData;
  }

  /**
   * @description Get moderation settings - Using same storage key as verification_settings API for data consistency across APIs Returns: ModerationSettings containing the current moderation configuration
   * @tags moderation, dbtn/module:moderation_settings_v1
   * @name get_moderation_settings_v12
   * @summary Get Moderation Settings V1
   * @request GET:/routes/moderation-settings/settings
   * @originalName get_moderation_settings_v1
   * @duplicate
   */
  export namespace get_moderation_settings_v12 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetModerationSettingsV12Data;
  }

  /**
   * @description Update moderation settings - Using same storage key as verification_settings API for data consistency across APIs Args: body: ModerationSettings data to save Returns: Dictionary with success message
   * @tags moderation, dbtn/module:moderation_settings_v1
   * @name update_moderation_settings_v12
   * @summary Update Moderation Settings V1
   * @request POST:/routes/moderation-settings/settings
   * @originalName update_moderation_settings_v1
   * @duplicate
   */
  export namespace update_moderation_settings_v12 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisModerationSettingsV1ModerationSettings;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateModerationSettingsV12Data;
  }

  /**
   * @description Test a moderation pattern against content Args: body: PatternTestRequest containing pattern and content to test Returns: PatternTestResult with match data
   * @tags moderation, dbtn/module:moderation_settings_v1
   * @name test_pattern_v12
   * @summary Test Pattern V1
   * @request POST:/routes/moderation-settings/test-pattern
   * @originalName test_pattern_v1
   * @duplicate
   */
  export namespace test_pattern_v12 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisModerationSettingsV1PatternTestRequest;
    export type RequestHeaders = {};
    export type ResponseBody = TestPatternV12Data;
  }

  /**
   * @description Get comprehensive KPI analytics dashboard This endpoint provides a complete view of platform performance across all KPI categories: - User Growth & Profile Engagement - Contact & Networking Activity - Matching Algorithm KPIs - Meetings & Deal Flow - Sector & Role-Based Insights - Subscription & Monetization Metrics - Satisfaction & Support - Additional Engagement Indicators - Performance & Scalability Args: period: Time period filter for analytics data Returns: ComprehensiveKPIDashboard with all platform KPIs
   * @tags analytics, dbtn/module:analytics_dashboard
   * @name get_comprehensive_analytics2
   * @summary Get Comprehensive Analytics
   * @request GET:/routes/kpi-dashboard
   * @originalName get_comprehensive_analytics
   * @duplicate
   */
  export namespace get_comprehensive_analytics2 {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Time period filters for analytics
       * @default "30d"
       */
      period?: PeriodFilter;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetComprehensiveAnalytics2Data;
  }

  /**
   * @description Get analytics summary for the current user
   * @tags dbtn/module:analytics_enhanced
   * @name get_analytics_summary
   * @summary Get Analytics Summary
   * @request GET:/routes/analytics/summary
   */
  export namespace get_analytics_summary {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAnalyticsSummaryData;
  }

  /**
   * @description Get comprehensive analytics for all KPIs across the platform
   * @tags dbtn/module:analytics_enhanced
   * @name get_comprehensive_analytics3
   * @summary Get Comprehensive Analytics
   * @request GET:/routes/comprehensive
   * @originalName get_comprehensive_analytics
   * @duplicate
   */
  export namespace get_comprehensive_analytics3 {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Period
       * Time period for analytics (7d, 30d, 90d, 12m, ytd, all)
       * @default "30d"
       */
      period?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetComprehensiveAnalytics3Data;
  }

  /**
   * @description Export analytics data in the specified format
   * @tags dbtn/module:analytics_enhanced
   * @name export_analytics
   * @summary Export Analytics
   * @request POST:/routes/analytics/export
   */
  export namespace export_analytics {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ExportFormat;
    export type RequestHeaders = {};
    export type ResponseBody = ExportAnalyticsData;
  }

  /**
   * @description Create a trackable link for a document
   * @tags dbtn/module:document_analytics
   * @name create_trackable_link
   * @summary Create Trackable Link
   * @request POST:/routes/documents/tracking/links/create
   */
  export namespace create_trackable_link {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateTrackableLinkRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateTrackableLinkData;
  }

  /**
   * @description Register sections of a document for tracking
   * @tags dbtn/module:document_analytics
   * @name register_document_sections
   * @summary Register Document Sections
   * @request POST:/routes/documents/tracking/sections
   */
  export namespace register_document_sections {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = DocumentSectionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RegisterDocumentSectionsData;
  }

  /**
   * @description Record a document analytics event
   * @tags dbtn/module:document_analytics
   * @name record_analytics_event
   * @summary Record Analytics Event
   * @request POST:/routes/documents/tracking/events
   */
  export namespace record_analytics_event {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RecordEventRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RecordAnalyticsEventData;
  }

  /**
   * @description Get analytics for a document
   * @tags dbtn/module:document_analytics
   * @name get_document_analytics
   * @summary Get Document Analytics
   * @request GET:/routes/documents/{document_id}/analytics
   */
  export namespace get_document_analytics {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {
      /** User Id */
      user_id?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDocumentAnalyticsData;
  }

  /**
   * @description Get all trackable links for a document
   * @tags dbtn/module:document_analytics
   * @name get_document_links
   * @summary Get Document Links
   * @request GET:/routes/documents/{document_id}/links
   */
  export namespace get_document_links {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {
      /** User Id */
      user_id?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDocumentLinksData;
  }

  /**
   * @description Get all registered sections for a document
   * @tags dbtn/module:document_analytics
   * @name get_document_sections
   * @summary Get Document Sections
   * @request GET:/routes/documents/{document_id}/sections
   */
  export namespace get_document_sections {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {
      /** User Id */
      user_id?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDocumentSectionsData;
  }

  /**
   * @description Get summary analytics for all documents of a user
   * @tags dbtn/module:document_analytics
   * @name get_analytics_summary2
   * @summary Get Analytics Summary
   * @request GET:/routes/documents/analytics/summary
   * @originalName get_analytics_summary
   * @duplicate
   */
  export namespace get_analytics_summary2 {
    export type RequestParams = {};
    export type RequestQuery = {
      /** User Id */
      user_id?: string;
      /** Document Type */
      document_type?: DocumentType | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAnalyticsSummary2Data;
  }

  /**
   * @description Get user's contact matching settings
   * @tags dbtn/module:contact_matching
   * @name get_matching_settings
   * @summary Get Matching Settings
   * @request GET:/routes/contact-matching/settings
   */
  export namespace get_matching_settings {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetMatchingSettingsData;
  }

  /**
   * @description Update user's contact matching settings
   * @tags dbtn/module:contact_matching
   * @name update_matching_settings
   * @summary Update Matching Settings
   * @request POST:/routes/contact-matching/settings
   */
  export namespace update_matching_settings {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ContactMatchSettings;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateMatchingSettingsData;
  }

  /**
   * @description Get globally matched contacts for a user's contacts
   * @tags dbtn/module:contact_matching
   * @name get_global_matches
   * @summary Get Global Matches
   * @request GET:/routes/contact-matching/global-matches
   */
  export namespace get_global_matches {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetGlobalMatchesData;
  }

  /**
   * @description Create a new search preset
   * @tags search, dbtn/module:search
   * @name create_search_preset
   * @summary Create Search Preset
   * @request POST:/routes/presets
   */
  export namespace create_search_preset {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SearchPresetInput;
    export type RequestHeaders = {};
    export type ResponseBody = CreateSearchPresetData;
  }

  /**
   * @description Get all search presets for a user
   * @tags search, dbtn/module:search
   * @name get_user_presets
   * @summary Get User Presets
   * @request GET:/routes/presets/{user_id}
   */
  export namespace get_user_presets {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserPresetsData;
  }

  /**
   * @description Delete a search preset
   * @tags search, dbtn/module:search
   * @name delete_search_preset
   * @summary Delete Search Preset
   * @request DELETE:/routes/presets/{preset_id}
   */
  export namespace delete_search_preset {
    export type RequestParams = {
      /** Preset Id */
      presetId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteSearchPresetData;
  }

  /**
   * @description Get search history for a user
   * @tags search, dbtn/module:search
   * @name get_search_history
   * @summary Get Search History
   * @request GET:/routes/history/{user_id}
   */
  export namespace get_search_history {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {
      /**
       * Limit
       * @default 10
       */
      limit?: number | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSearchHistoryData;
  }

  /**
   * @description Search for users based on filters and optionally save to history Returns a paginated response with matched profiles. If no profiles are found, returns an empty response with total=0.
   * @tags search, dbtn/module:search
   * @name search_users
   * @summary Search Users
   * @request POST:/routes/users/search
   */
  export namespace search_users {
    export type RequestParams = {};
    export type RequestQuery = {
      /** User Id */
      user_id?: string | null;
    };
    export type RequestBody = AppApisModelsSearchFilters;
    export type RequestHeaders = {};
    export type ResponseBody = SearchUsersData;
  }

  /**
   * @description Update the last used timestamp of a preset
   * @tags search, dbtn/module:search
   * @name update_preset_last_used
   * @summary Update Preset Last Used
   * @request PUT:/routes/presets/{preset_id}/last-used
   */
  export namespace update_preset_last_used {
    export type RequestParams = {
      /** Preset Id */
      presetId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = UpdatePresetLastUsedData;
  }

  /**
   * No description
   * @tags dbtn/module:matching
   * @name get_user_matches
   * @summary Get User Matches
   * @request POST:/routes/get-matches
   */
  export namespace get_user_matches {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GetUserMatchesRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserMatchesData;
  }

  /**
   * @description Update a user's matching preferences
   * @tags dbtn/module:matching
   * @name update_match_preferences
   * @summary Update Match Preferences
   * @request POST:/routes/update-match-preferences
   */
  export namespace update_match_preferences {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdatePreferencesRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateMatchPreferencesData;
  }

  /**
   * @description Record that two users have been matched
   * @tags dbtn/module:matching
   * @name record_match
   * @summary Record Match
   * @request POST:/routes/record-match
   */
  export namespace record_match {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RecordMatchRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RecordMatchData;
  }

  /**
   * @description Get comprehensive analytics dashboard for Fund of Funds users
   * @tags fund-of-funds-analytics, dbtn/module:fund_of_funds_analytics
   * @name get_comprehensive_dashboard
   * @summary Get Comprehensive Dashboard
   * @request GET:/routes/fund-of-funds-analytics/dashboard
   */
  export namespace get_comprehensive_dashboard {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetComprehensiveDashboardData;
  }

  /**
   * @description Get detailed performance metrics for a specific fund manager
   * @tags fund-of-funds-analytics, dbtn/module:fund_of_funds_analytics
   * @name get_fund_manager_performance
   * @summary Get Fund Manager Performance
   * @request GET:/routes/fund-of-funds-analytics/fund-manager/{fund_id}
   */
  export namespace get_fund_manager_performance {
    export type RequestParams = {
      /** Fund Id */
      fundId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetFundManagerPerformanceData;
  }

  /**
   * @description Get investment scorecard with detailed evaluation for a fund
   * @tags fund-of-funds-analytics, dbtn/module:fund_of_funds_analytics
   * @name get_investment_scorecard
   * @summary Get Investment Scorecard
   * @request GET:/routes/fund-of-funds-analytics/investment-scorecard/{fund_id}
   */
  export namespace get_investment_scorecard {
    export type RequestParams = {
      /** Fund Id */
      fundId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetInvestmentScorecardData;
  }

  /**
   * @description Get performance analytics across different investment sectors
   * @tags fund-of-funds-analytics, dbtn/module:fund_of_funds_analytics
   * @name get_sector_performance
   * @summary Get Sector Performance
   * @request GET:/routes/fund-of-funds-analytics/sector-performance
   */
  export namespace get_sector_performance {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSectorPerformanceData;
  }

  /**
   * @description Get investment patterns of Limited Partners
   * @tags fund-of-funds-analytics, dbtn/module:fund_of_funds_analytics
   * @name get_lp_investment_patterns
   * @summary Get Lp Investment Patterns
   * @request GET:/routes/fund-of-funds-analytics/lp-patterns
   */
  export namespace get_lp_investment_patterns {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetLpInvestmentPatternsData;
  }

  /**
   * @description Get performance metrics of Capital Raisers
   * @tags fund-of-funds-analytics, dbtn/module:fund_of_funds_analytics
   * @name get_capital_raiser_performance
   * @summary Get Capital Raiser Performance
   * @request GET:/routes/fund-of-funds-analytics/capital-raiser-performance
   */
  export namespace get_capital_raiser_performance {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCapitalRaiserPerformanceData;
  }

  /**
   * @description Get analytics on network strength and connections
   * @tags fund-of-funds-analytics, dbtn/module:fund_of_funds_analytics
   * @name get_network_strength2
   * @summary Get Network Strength
   * @request GET:/routes/fund-of-funds-analytics/network-strength
   * @originalName get_network_strength
   * @duplicate
   */
  export namespace get_network_strength2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetNetworkStrength2Data;
  }
}
