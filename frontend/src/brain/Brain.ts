import {
  ActivateAffiliateData,
  ActivateAffiliateError,
  ActivateAffiliateParams,
  AddAttachmentData,
  AddAttachmentError,
  AddAttachmentParams,
  AddAttachmentPayload,
  AddContentRuleData,
  AddContentRuleError,
  AddContentRuleV1Data,
  AddContentRuleV1Error,
  AddPaymentMethodData,
  AddPaymentMethodError,
  AddPaymentMethodParams,
  AddReactionData,
  AddReactionError,
  AddReactionRequest,
  AnonymizationConfig,
  AnonymizeDataData,
  AnonymizeDataError,
  AppApisAiListBuilderSearchFilters,
  AppApisAuthUtilsTokenRequest,
  AppApisContactsIntroductionRequest,
  AppApisContentRulesAddContentRuleRequest,
  AppApisContentRulesPatternTestRequest,
  AppApisIntroductionsIntroductionRequest,
  AppApisModelsPatternTestRequest,
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
  BatchUpdateRulesError,
  BatchUpdateRulesPayload,
  BatchUpdateRulesV1Data,
  BatchUpdateRulesV1Error,
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
  BulkEnrichInvestorProfilesError,
  BulkEnrichInvestorProfilesPayload,
  CalculateCommissionData,
  CalculateCommissionError,
  CalculateCommissionParams,
  CalculateCommissionPayload,
  CalculateNetworkStrengthData,
  CalculateNetworkStrengthError,
  CalculateNetworkStrengthParams,
  CalculateRelationshipStrengthData,
  CalculateRelationshipStrengthError,
  CalculateRelationshipStrengthParams,
  CalculateTierData,
  CalculateTierError,
  CalculateTierParams,
  CancelSubscriptionData,
  CancelSubscriptionError,
  CancellationRequest,
  CheckHealthData,
  CheckHealthRouterData,
  CommissionStructure,
  ContactMatchSettings,
  ConvertReferralData,
  ConvertReferralError,
  ConvertReferralParams,
  CreateCommentData,
  CreateCommentError,
  CreateCommentRequest,
  CreateCommissionStructureData,
  CreateCommissionStructureError,
  CreateConnectAccountData,
  CreateConnectAccountError,
  CreateConnectAccountRequest,
  CreateIntroductionData,
  CreateIntroductionError,
  CreatePayoutData,
  CreatePayoutError,
  CreateProfileData,
  CreateProfileError,
  CreateProfileRequest,
  CreateProfileV2Data,
  CreateProfileV2Error,
  CreateReferralCodeData,
  CreateReferralCodeError,
  CreateReferralCodeParams,
  CreateRelationshipData,
  CreateRelationshipError,
  CreateSearchPresetData,
  CreateSearchPresetError,
  CreateTestPaymentData,
  CreateTestPaymentError,
  CreateTestPaymentRequest,
  CreateTicketData,
  CreateTicketError,
  CreateTrackableLinkData,
  CreateTrackableLinkError,
  CreateTrackableLinkRequest,
  CreateTrialCodeData,
  CreateTrialCodeError,
  CreateTrialCodeRequest,
  DeactivateTrialCodeData,
  DeactivateTrialCodeError,
  DeactivateTrialCodeParams,
  DeleteCommentData,
  DeleteCommentError,
  DeleteCommentParams,
  DeleteDocumentData,
  DeleteDocumentError,
  DeleteDocumentParams,
  DeleteSearchPresetData,
  DeleteSearchPresetError,
  DeleteSearchPresetParams,
  DocumentSectionRequest,
  DownloadAttachmentData,
  DownloadAttachmentError,
  DownloadAttachmentParams,
  DownloadDocumentData,
  DownloadDocumentError,
  DownloadDocumentParams,
  DownloadExportData,
  DownloadExportError,
  DownloadExportParams,
  EmailNotification,
  EnrichInvestorProfileData,
  EnrichInvestorProfileError,
  EnrichedInvestorProfile,
  EstimateExportSizeData,
  EstimateExportSizeError,
  EstimateRequest,
  ExportAnalyticsData,
  ExportAnalyticsError,
  ExportFormat,
  ExportRequest,
  ExportUserDataData,
  ExportUserDataError,
  FeedbackRating,
  GetAdminAnalytics2Data,
  GetAdminAnalyticsByPathData,
  GetAdminAnalyticsDashboardData,
  GetAdminAnalyticsEndpointData,
  GetAdminAnalyticsRootData,
  GetAdminAuditLogsData,
  GetAdminAuditLogsError,
  GetAdminAuditLogsParams,
  GetAdminAuditLogsPayload,
  GetAdminDashboardData,
  GetAdminRolePermissionsData,
  GetAdminRolePermissionsError,
  GetAdminRolePermissionsPayload,
  GetAffiliateSettingsEndpointData,
  GetAffiliateSettingsEndpointError,
  GetAffiliateSettingsEndpointParams,
  GetAffiliateStatusEndpointData,
  GetAffiliateStatusEndpointError,
  GetAffiliateStatusEndpointParams,
  GetAnalyticsSummary2Data,
  GetAnalyticsSummary2Error,
  GetAnalyticsSummary2Params,
  GetAnalyticsSummaryData,
  GetAnonymizationPreferencesData,
  GetAnonymizationPreferencesError,
  GetAnonymizationPreferencesParams,
  GetAuditLogsData,
  GetAuditLogsError,
  GetAuditLogsParams,
  GetCancellationStatusData,
  GetCancellationStatusError,
  GetCancellationStatusParams,
  GetCapitalRaiserAnalyticsData,
  GetCapitalRaiserAnalyticsError,
  GetCapitalRaiserAnalyticsParams,
  GetCapitalRaiserPerformanceData,
  GetCommentAnalyticsData,
  GetCommissionPaymentsData,
  GetCommissionPaymentsError,
  GetCommissionPaymentsParams,
  GetCommissionStructureData,
  GetCommissionStructureError,
  GetCommissionStructureParams,
  GetComprehensiveAnalytics2Data,
  GetComprehensiveAnalytics2Error,
  GetComprehensiveAnalytics2Params,
  GetComprehensiveAnalytics3Data,
  GetComprehensiveAnalytics3Error,
  GetComprehensiveAnalytics3Params,
  GetComprehensiveAnalyticsData,
  GetComprehensiveAnalyticsError,
  GetComprehensiveAnalyticsParams,
  GetComprehensiveDashboardData,
  GetConnectAccountData,
  GetConnectAccountError,
  GetConnectAccountParams,
  GetContactMatchesData,
  GetContactMatchesError,
  GetContentReports2Data,
  GetContentReports2Error,
  GetContentReports2Params,
  GetContentReports2Payload,
  GetContentReportsV12Data,
  GetContentReportsV12Error,
  GetContentReportsV12Params,
  GetContentReportsV1Data,
  GetContentReportsV1Error,
  GetContentReportsV1Params,
  GetContentReportsV1Payload,
  GetContentReportsV2Data,
  GetContentReportsV2Error,
  GetContentReportsV2Params,
  GetContentReportsWrapperData,
  GetContentReportsWrapperError,
  GetContentReportsWrapperParams,
  GetContentRules2Data,
  GetContentRules2Error,
  GetContentRules2Payload,
  GetContentRulesData,
  GetContentRulesV12Data,
  GetContentRulesV12Result,
  GetContentRulesV1Data,
  GetContentRulesV1Error,
  GetContentRulesV1Payload,
  GetContentRulesV2Data,
  GetContentRulesWrapperData,
  GetConversationsData,
  GetConversationsError,
  GetDefaultRulesData,
  GetDocumentAnalyticsData,
  GetDocumentAnalyticsError,
  GetDocumentAnalyticsParams,
  GetDocumentAuditLogsData,
  GetDocumentAuditLogsError,
  GetDocumentAuditLogsParams,
  GetDocumentData,
  GetDocumentError,
  GetDocumentLinksData,
  GetDocumentLinksError,
  GetDocumentLinksParams,
  GetDocumentParams,
  GetDocumentSectionsData,
  GetDocumentSectionsError,
  GetDocumentSectionsParams,
  GetDocumentVersionData,
  GetDocumentVersionError,
  GetDocumentVersionParams,
  GetDocumentVersionsData,
  GetDocumentVersionsError,
  GetDocumentVersionsParams,
  GetEntityData,
  GetEntityError,
  GetEntityParams,
  GetEnumsData,
  GetExportProgressData,
  GetExportProgressError,
  GetExportProgressParams,
  GetFeatureAccessData,
  GetFeatureAccessError,
  GetFeatureAccessParams,
  GetFeedbackAnalyticsData,
  GetFundManagerAnalyticsData,
  GetFundManagerAnalyticsError,
  GetFundManagerAnalyticsParams,
  GetFundManagerPerformanceData,
  GetFundManagerPerformanceError,
  GetFundManagerPerformanceParams,
  GetFundSizeDistributionData,
  GetFundraisingAnalyticsData,
  GetGlobalMatchesData,
  GetHistoricalPerformanceData,
  GetHowtoGuideData,
  GetHowtoGuideError,
  GetHowtoGuideParams,
  GetIntroductionData,
  GetIntroductionError,
  GetIntroductionParams,
  GetIntroductionStatusData,
  GetIntroductionStatusError,
  GetIntroductionStatusParams,
  GetInvestmentFocusDistributionData,
  GetInvestmentScorecardData,
  GetInvestmentScorecardError,
  GetInvestmentScorecardParams,
  GetInvoicesData,
  GetInvoicesError,
  GetInvoicesParams,
  GetKbArticleData,
  GetKbArticleError,
  GetKbArticleParams,
  GetLpAnalyticsData,
  GetLpAnalyticsError,
  GetLpAnalyticsParams,
  GetLpInvestmentPatternsData,
  GetMatchingAnalyticsData,
  GetMatchingSettingsData,
  GetMessagesData,
  GetMessagesError,
  GetMessagesParams,
  GetModerationActions2Data,
  GetModerationActions2Error,
  GetModerationActions2Payload,
  GetModerationActionsData,
  GetModerationActionsV1Data,
  GetModerationActionsV1Error,
  GetModerationActionsV1Params,
  GetModerationActionsV1Payload,
  GetModerationMetrics2Data,
  GetModerationMetrics2Error,
  GetModerationMetrics2GetData,
  GetModerationMetrics2Payload,
  GetModerationMetricsData,
  GetModerationMetricsV1Data,
  GetModerationMetricsV1Error,
  GetModerationSettingsData,
  GetModerationSettingsV12Data,
  GetModerationSettingsV1Data,
  GetNetworkStrength2Data,
  GetNetworkStrengthData,
  GetNetworkStrengthError,
  GetNetworkStrengthParams,
  GetPaymentMethodsData,
  GetPaymentMethodsError,
  GetPaymentMethodsParams,
  GetPendingVerificationsData,
  GetPermissionsData,
  GetPermissionsError,
  GetPermissionsPayload,
  GetProfileEndpointData,
  GetProfileEndpointError,
  GetProfileEndpointParams,
  GetProfileV1Data,
  GetProfileV1Error,
  GetProfileV1Params,
  GetProfileV2Data,
  GetProfileV2Error,
  GetProfileV2Params,
  GetQuotaData,
  GetQuotaError,
  GetQuotaParams,
  GetReactionsData,
  GetReactionsError,
  GetReactionsParams,
  GetReferralLinksData,
  GetReferralLinksError,
  GetReferralLinksParams,
  GetReferralStatsData,
  GetReferralStatsError,
  GetReferralStatsParams,
  GetRefundStatusData,
  GetRefundStatusError,
  GetRefundStatusParams,
  GetRelationshipData,
  GetRelationshipError,
  GetRelationshipParams,
  GetRelationshipStrengthV1Data,
  GetRelationshipStrengthV1Error,
  GetRelationshipStrengthV1Params,
  GetRelationshipsData,
  GetRelationshipsError,
  GetRelationshipsParams,
  GetRiskProfileDistributionData,
  GetRolePermissionsData,
  GetRolePermissionsError,
  GetRuleEffectivenessData,
  GetRuleEffectivenessError,
  GetRuleEffectivenessParams,
  GetRuleEffectivenessV1Data,
  GetRuleEffectivenessV1Error,
  GetRuleEffectivenessV1Params,
  GetRuleEffectivenessV1Payload,
  GetSearchHistoryData,
  GetSearchHistoryError,
  GetSearchHistoryParams,
  GetSectorPerformanceData,
  GetSourceStatusData,
  GetStorageStatsData,
  GetSubscriptionFeaturesData,
  GetSubscriptionPlansData,
  GetTestPaymentData,
  GetTestPaymentError,
  GetTestPaymentParams,
  GetTicketData,
  GetTicketError,
  GetTicketParams,
  GetTicketPayload,
  GetTierRequirementsData,
  GetTierStatusData,
  GetTierStatusError,
  GetTierStatusParams,
  GetTransactionsData,
  GetTransactionsError,
  GetTransactionsParams,
  GetTypingStatusData,
  GetTypingStatusError,
  GetTypingStatusParams,
  GetUserConnectAccountsData,
  GetUserConnectAccountsError,
  GetUserConnectAccountsParams,
  GetUserMatchesData,
  GetUserMatchesError,
  GetUserMatchesRequest,
  GetUserPresetsData,
  GetUserPresetsError,
  GetUserPresetsParams,
  GetUserRelationshipsData,
  GetUserRelationshipsError,
  GetUserRelationshipsParams,
  GetUserSubscriptionData,
  GetUserSubscriptionError,
  GetUserSubscriptionParams,
  GetUserTypeAnalyticsData,
  GetUserTypeAnalyticsError,
  GetUserTypeAnalyticsParams,
  GetVerificationConfigData,
  GetVerificationSettingsData,
  GetVerificationStatusData,
  GetVerificationStatusError,
  GetVerificationStatusParams,
  GetVisibilitySettingsData,
  GetVisibilitySettingsError,
  GetVisibilitySettingsParams,
  HealthCheckData,
  ImportContactsData,
  ImportContactsError,
  ImportContactsRequest,
  Interaction,
  IntroductionUpdate,
  ListAdminUsersData,
  ListAdminUsersError,
  ListAdminUsersPayload,
  ListCapitalRaiserIssuesData,
  ListCommentsData,
  ListCommentsError,
  ListCommentsParams,
  ListCommissionStructuresData,
  ListCommissionStructuresError,
  ListCommissionStructuresParams,
  ListContactsData,
  ListContactsError,
  ListDocumentsData,
  ListDocumentsError,
  ListDocumentsParams,
  ListHowtoGuidesData,
  ListKbArticlesData,
  ListProfilesRequest,
  ListProfilesV1Data,
  ListProfilesV1Error,
  ListProfilesV2Data,
  ListProfilesV2Error,
  ListProfilesV2Params,
  ListTestPaymentsData,
  ListTicketsData,
  ListTicketsError,
  ListTicketsParams,
  ListTicketsPayload,
  ListTrialCodesData,
  ListUserIntroductionsData,
  ListUserIntroductionsError,
  ListUserIntroductionsParams,
  MarkThreadReadStatusData,
  MarkThreadReadStatusError,
  MarkThreadReadStatusParams,
  ModerateCommentData,
  ModerateCommentError,
  ModerateCommentParams,
  PayoutRequest,
  ProcessCommissionPaymentData,
  ProcessCommissionPaymentError,
  ProcessCommissionPaymentParams,
  ProfileVisibility,
  ReactToCommentData,
  ReactToCommentError,
  ReactToCommentParams,
  RecordAnalyticsEventData,
  RecordAnalyticsEventError,
  RecordEventRequest,
  RecordInteractionData,
  RecordInteractionError,
  RecordInteractionParams,
  RecordMatchData,
  RecordMatchError,
  RecordMatchRequest,
  RefreshDataData,
  RefundRequest,
  RegisterDocumentSectionsData,
  RegisterDocumentSectionsError,
  Relationship,
  RemoveReactionData,
  RemoveReactionError,
  RemoveReactionRequest,
  ReportCommentData,
  ReportCommentError,
  ReportCommentParams,
  RequestIntroductionData,
  RequestIntroductionError,
  RequestRefundData,
  RequestRefundError,
  RestoreDocumentVersionData,
  RestoreDocumentVersionError,
  RestoreDocumentVersionParams,
  ReviewDocumentData,
  ReviewDocumentError,
  ReviewRequest,
  RouteAdminAnalyticsDashboardEndpointData,
  SaveAnonymizationPreferencesData,
  SaveAnonymizationPreferencesError,
  SearchCommentsData,
  SearchCommentsError,
  SearchCommentsParams,
  SearchEntitiesData,
  SearchEntitiesError,
  SearchEntitiesParams,
  SearchInvestorsData,
  SearchInvestorsError,
  SearchKbArticlesData,
  SearchKbArticlesError,
  SearchKbArticlesParams,
  SearchPresetInput,
  SearchUsersData,
  SearchUsersError,
  SearchUsersParams,
  SendMessageEndpointData,
  SendMessageEndpointError,
  ShareDocumentData,
  ShareDocumentError,
  ShareDocumentParams,
  ShareDocumentPayload,
  StartTrialData,
  StartTrialError,
  StartTrialRequest,
  StoreProfileEndpointData,
  StoreProfileEndpointError,
  StoreProfileEndpointParams,
  StoreProfileEndpointPayload,
  SubmitFeedbackData,
  SubmitFeedbackError,
  SubmitVerificationData,
  SubmitVerificationError,
  SubscriptionUpdate,
  TestEmailNotificationData,
  TestEmailNotificationError,
  TestFileTypeDetectionData,
  TestMalwareDetectionData,
  TestModerationPatternData,
  TestModerationPatternError,
  TestPattern2Data,
  TestPattern2Error,
  TestPatternData,
  TestPatternError,
  TestPatternV12Data,
  TestPatternV12Error,
  TestPatternV1Data,
  TestPatternV1Error,
  ToggleThreadMuteData,
  ToggleThreadMuteError,
  ToggleThreadMuteParams,
  TrackReferralData,
  TrackReferralError,
  TrackReferralParams,
  TrackReferralVisitData,
  TrackReferralVisitError,
  TrackReferralVisitParams,
  TransferOwnershipData,
  TransferOwnershipError,
  TransferOwnershipRequest,
  UpdateAffiliateSettingsData,
  UpdateAffiliateSettingsError,
  UpdateAffiliateSettingsParams,
  UpdateAffiliateSettingsPayload,
  UpdateCommentData,
  UpdateCommentError,
  UpdateCommentParams,
  UpdateCommentRequest,
  UpdateCommissionStructureData,
  UpdateCommissionStructureError,
  UpdateCommissionStructureParams,
  UpdateContentRuleData,
  UpdateContentRuleError,
  UpdateContentRuleParams,
  UpdateContentRulePayload,
  UpdateContentRuleV1Data,
  UpdateContentRuleV1Error,
  UpdateContentRuleV1Params,
  UpdateContentRulesData,
  UpdateContentRulesError,
  UpdateContentRulesPayload,
  UpdateContentRulesV1Data,
  UpdateContentRulesV1Error,
  UpdateContentRulesV1Payload,
  UpdateIntroductionStatusData,
  UpdateIntroductionStatusError,
  UpdateIntroductionStatusParams,
  UpdateMatchPreferencesData,
  UpdateMatchPreferencesError,
  UpdateMatchingSettingsData,
  UpdateMatchingSettingsError,
  UpdateModerationSettingsData,
  UpdateModerationSettingsError,
  UpdateModerationSettingsV12Data,
  UpdateModerationSettingsV12Error,
  UpdateModerationSettingsV1Data,
  UpdateModerationSettingsV1Error,
  UpdatePreferencesRequest,
  UpdatePresetLastUsedData,
  UpdatePresetLastUsedError,
  UpdatePresetLastUsedParams,
  UpdateProfileEndpointData,
  UpdateProfileEndpointError,
  UpdateProfileEndpointParams,
  UpdateProfileEndpointPayload,
  UpdateProfileManagementData,
  UpdateProfileManagementError,
  UpdateProfileManagementParams,
  UpdateProfileManagementPayload,
  UpdateRelationshipStatusData,
  UpdateRelationshipStatusError,
  UpdateRelationshipStatusParams,
  UpdateReportRequest,
  UpdateReportStatus2Data,
  UpdateReportStatus2Error,
  UpdateReportStatusData,
  UpdateReportStatusError,
  UpdateReportStatusParams,
  UpdateReportStatusRequest,
  UpdateReportStatusV1Data,
  UpdateReportStatusV1Error,
  UpdateRolePermissionsData,
  UpdateRolePermissionsError,
  UpdateRolePermissionsRequest,
  UpdateSubscriptionData,
  UpdateSubscriptionError,
  UpdateSubscriptionParams,
  UpdateTicketData,
  UpdateTicketError,
  UpdateTicketParams,
  UpdateTypingIndicatorData,
  UpdateTypingIndicatorError,
  UpdateUserRoleData,
  UpdateUserRoleError,
  UpdateUserRoleRequest,
  UpdateUserStatusData,
  UpdateUserStatusError,
  UpdateUserStatusRequest,
  UpdateVerificationConfigData,
  UpdateVerificationConfigError,
  UpdateVerificationSettingsData,
  UpdateVerificationSettingsError,
  UpdateVisibilityManagementData,
  UpdateVisibilityManagementError,
  UpdateVisibilityManagementParams,
  UpdateVisibilityRequest,
  UpdateVisibilitySettingsData,
  UpdateVisibilitySettingsError,
  UploadAttachmentData,
  UploadAttachmentError,
  UploadCapitalRaiserIssuesData,
  UploadCapitalRaiserIssuesError,
  UploadDocumentData,
  UploadDocumentError,
  UploadDocumentParams,
  UploadProfileImageData,
  UploadProfileImageError,
  UploadVerificationDocumentData,
  UploadVerificationDocumentError,
  VerificationRequest,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get audit logs with optional limit
   *
   * @tags dbtn/module:audit
   * @name get_audit_logs
   * @summary Get Audit Logs
   * @request GET:/routes/audit/logs
   */
  get_audit_logs = (query: GetAuditLogsParams, params: RequestParams = {}) =>
    this.request<GetAuditLogsData, GetAuditLogsError>({
      path: `/routes/audit/logs`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get audit logs for a specific document
   *
   * @tags dbtn/module:audit
   * @name get_document_audit_logs
   * @summary Get Document Audit Logs
   * @request GET:/routes/audit/logs/document/{document_id}
   */
  get_document_audit_logs = ({ documentId, ...query }: GetDocumentAuditLogsParams, params: RequestParams = {}) =>
    this.request<GetDocumentAuditLogsData, GetDocumentAuditLogsError>({
      path: `/routes/audit/logs/document/${documentId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Anonymize data according to specified rules Args: data: The data to anonymize config: Anonymization configuration including rules Returns: AnonymizedData containing the anonymized data and list of applied rules
   *
   * @tags dbtn/module:privacy
   * @name anonymize_data
   * @summary Anonymize Data
   * @request POST:/routes/anonymize-data
   */
  anonymize_data = (data: BodyAnonymizeData, params: RequestParams = {}) =>
    this.request<AnonymizeDataData, AnonymizeDataError>({
      path: `/routes/anonymize-data`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get default anonymization rules for common data types
   *
   * @tags dbtn/module:privacy
   * @name get_default_rules
   * @summary Get Default Rules
   * @request GET:/routes/default-rules
   */
  get_default_rules = (params: RequestParams = {}) =>
    this.request<GetDefaultRulesData, any>({
      path: `/routes/default-rules`,
      method: "GET",
      ...params,
    });

  /**
   * @description Save user's anonymization preferences
   *
   * @tags dbtn/module:privacy
   * @name save_anonymization_preferences
   * @summary Save Anonymization Preferences
   * @request POST:/routes/save-preferences
   */
  save_anonymization_preferences = (data: AnonymizationConfig, params: RequestParams = {}) =>
    this.request<SaveAnonymizationPreferencesData, SaveAnonymizationPreferencesError>({
      path: `/routes/save-preferences`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get user's saved anonymization preferences
   *
   * @tags dbtn/module:privacy
   * @name get_anonymization_preferences
   * @summary Get Anonymization Preferences
   * @request GET:/routes/get-preferences/{user_id}
   */
  get_anonymization_preferences = (
    { userId, ...query }: GetAnonymizationPreferencesParams,
    params: RequestParams = {},
  ) =>
    this.request<GetAnonymizationPreferencesData, GetAnonymizationPreferencesError>({
      path: `/routes/get-preferences/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Run comprehensive tests for file type detection
   *
   * @tags dbtn/module:file_type_tests
   * @name test_file_type_detection
   * @summary Test File Type Detection
   * @request POST:/routes/test/file-type-detection
   */
  test_file_type_detection = (params: RequestParams = {}) =>
    this.request<TestFileTypeDetectionData, any>({
      path: `/routes/test/file-type-detection`,
      method: "POST",
      ...params,
    });

  /**
   * @description Test malware detection capabilities
   *
   * @tags dbtn/module:file_type_tests
   * @name test_malware_detection
   * @summary Test Malware Detection
   * @request POST:/routes/test/malware-detection
   */
  test_malware_detection = (params: RequestParams = {}) =>
    this.request<TestMalwareDetectionData, any>({
      path: `/routes/test/malware-detection`,
      method: "POST",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:message_reactions
   * @name add_reaction
   * @summary Add Reaction
   * @request POST:/routes/add-reaction
   */
  add_reaction = (data: AddReactionRequest, params: RequestParams = {}) =>
    this.request<AddReactionData, AddReactionError>({
      path: `/routes/add-reaction`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:message_reactions
   * @name remove_reaction
   * @summary Remove Reaction
   * @request POST:/routes/remove-reaction
   */
  remove_reaction = (data: RemoveReactionRequest, params: RequestParams = {}) =>
    this.request<RemoveReactionData, RemoveReactionError>({
      path: `/routes/remove-reaction`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:message_reactions
   * @name get_reactions
   * @summary Get Reactions
   * @request GET:/routes/get-reactions/{message_id}
   */
  get_reactions = ({ messageId, ...query }: GetReactionsParams, params: RequestParams = {}) =>
    this.request<GetReactionsData, GetReactionsError>({
      path: `/routes/get-reactions/${messageId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Submit user feedback for a page
   *
   * @tags dbtn/module:feedback
   * @name submit_feedback
   * @summary Submit Feedback
   * @request POST:/routes/submit-feedback
   */
  submit_feedback = (data: FeedbackRating, params: RequestParams = {}) =>
    this.request<SubmitFeedbackData, SubmitFeedbackError>({
      path: `/routes/submit-feedback`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get analytics for collected feedback
   *
   * @tags dbtn/module:feedback
   * @name get_feedback_analytics
   * @summary Get Feedback Analytics
   * @request GET:/routes/feedback-analytics
   */
  get_feedback_analytics = (params: RequestParams = {}) =>
    this.request<GetFeedbackAnalyticsData, any>({
      path: `/routes/feedback-analytics`,
      method: "GET",
      ...params,
    });

  /**
   * @description Test endpoint for email notifications
   *
   * @tags notifications, dbtn/module:notifications
   * @name test_email_notification
   * @summary Test Email Notification
   * @request POST:/routes/api/notifications/test-email
   */
  test_email_notification = (data: EmailNotification, params: RequestParams = {}) =>
    this.request<TestEmailNotificationData, TestEmailNotificationError>({
      path: `/routes/api/notifications/test-email`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a new comment on a ticket
   *
   * @tags comments, stream, dbtn/module:comments
   * @name create_comment
   * @summary Create Comment
   * @request POST:/routes/api/comments
   */
  create_comment = (data: CreateCommentRequest, params: RequestParams = {}) =>
    this.requestStream<CreateCommentData, CreateCommentError>({
      path: `/routes/api/comments`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all comments for a ticket
   *
   * @tags comments, stream, dbtn/module:comments
   * @name list_comments
   * @summary List Comments
   * @request GET:/routes/api/comments/tickets/{ticket_id}
   */
  list_comments = ({ ticketId, ...query }: ListCommentsParams, params: RequestParams = {}) =>
    this.requestStream<ListCommentsData, ListCommentsError>({
      path: `/routes/api/comments/tickets/${ticketId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update an existing comment
   *
   * @tags comments, stream, dbtn/module:comments
   * @name update_comment
   * @summary Update Comment
   * @request PUT:/routes/api/comments/{comment_id}
   */
  update_comment = (
    { commentId, ...query }: UpdateCommentParams,
    data: UpdateCommentRequest,
    params: RequestParams = {},
  ) =>
    this.requestStream<UpdateCommentData, UpdateCommentError>({
      path: `/routes/api/comments/${commentId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a comment
   *
   * @tags comments, stream, dbtn/module:comments
   * @name delete_comment
   * @summary Delete Comment
   * @request DELETE:/routes/api/comments/{comment_id}
   */
  delete_comment = ({ commentId, ...query }: DeleteCommentParams, params: RequestParams = {}) =>
    this.requestStream<DeleteCommentData, DeleteCommentError>({
      path: `/routes/api/comments/${commentId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description React to a comment with an emoji
   *
   * @tags comments, stream, dbtn/module:comments
   * @name react_to_comment
   * @summary React To Comment
   * @request POST:/routes/api/comments/{comment_id}/react
   */
  react_to_comment = ({ commentId, ...query }: ReactToCommentParams, params: RequestParams = {}) =>
    this.requestStream<ReactToCommentData, ReactToCommentError>({
      path: `/routes/api/comments/${commentId}/react`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Report a comment for moderation
   *
   * @tags comments, stream, dbtn/module:comments
   * @name report_comment
   * @summary Report Comment
   * @request POST:/routes/api/comments/{comment_id}/report
   */
  report_comment = ({ commentId, ...query }: ReportCommentParams, params: RequestParams = {}) =>
    this.requestStream<ReportCommentData, ReportCommentError>({
      path: `/routes/api/comments/${commentId}/report`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Moderate a reported comment (admin only)
   *
   * @tags comments, stream, dbtn/module:comments
   * @name moderate_comment
   * @summary Moderate Comment
   * @request POST:/routes/api/comments/{comment_id}/moderate
   */
  moderate_comment = ({ commentId, ...query }: ModerateCommentParams, params: RequestParams = {}) =>
    this.requestStream<ModerateCommentData, ModerateCommentError>({
      path: `/routes/api/comments/${commentId}/moderate`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Search comments by content
   *
   * @tags comments, stream, dbtn/module:comments
   * @name search_comments
   * @summary Search Comments
   * @request GET:/routes/api/comments/search
   */
  search_comments = (query: SearchCommentsParams, params: RequestParams = {}) =>
    this.requestStream<SearchCommentsData, SearchCommentsError>({
      path: `/routes/api/comments/search`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get analytics about comments
   *
   * @tags comments, stream, dbtn/module:comments
   * @name get_comment_analytics
   * @summary Get Comment Analytics
   * @request GET:/routes/api/comments/analytics
   */
  get_comment_analytics = (params: RequestParams = {}) =>
    this.requestStream<GetCommentAnalyticsData, any>({
      path: `/routes/api/comments/analytics`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:capital_raiser_issues
   * @name upload_capital_raiser_issues
   * @summary Upload Capital Raiser Issues
   * @request POST:/routes/upload-issues
   */
  upload_capital_raiser_issues = (data: BodyUploadCapitalRaiserIssues, params: RequestParams = {}) =>
    this.request<UploadCapitalRaiserIssuesData, UploadCapitalRaiserIssuesError>({
      path: `/routes/upload-issues`,
      method: "POST",
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:capital_raiser_issues
   * @name list_capital_raiser_issues
   * @summary List Capital Raiser Issues
   * @request GET:/routes/list-issues
   */
  list_capital_raiser_issues = (params: RequestParams = {}) =>
    this.request<ListCapitalRaiserIssuesData, any>({
      path: `/routes/list-issues`,
      method: "GET",
      ...params,
    });

  /**
   * @description Enrich investor profile with Crunchbase data
   *
   * @tags dbtn/module:investor_enrichment
   * @name enrich_investor_profile
   * @summary Enrich Investor Profile
   * @request POST:/routes/enrich
   */
  enrich_investor_profile = (data: EnrichedInvestorProfile, params: RequestParams = {}) =>
    this.request<EnrichInvestorProfileData, EnrichInvestorProfileError>({
      path: `/routes/enrich`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Enrich multiple investor profiles with Crunchbase data
   *
   * @tags dbtn/module:investor_enrichment
   * @name bulk_enrich_investor_profiles
   * @summary Bulk Enrich Investor Profiles
   * @request POST:/routes/bulk-enrich
   */
  bulk_enrich_investor_profiles = (data: BulkEnrichInvestorProfilesPayload, params: RequestParams = {}) =>
    this.request<BulkEnrichInvestorProfilesData, BulkEnrichInvestorProfilesError>({
      path: `/routes/bulk-enrich`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get comprehensive analytics for an investment manager
   *
   * @tags dbtn/module:sec_analytics
   * @name get_comprehensive_analytics
   * @summary Get Comprehensive Analytics
   * @request GET:/routes/analytics/{cik}
   */
  get_comprehensive_analytics = ({ cik, ...query }: GetComprehensiveAnalyticsParams, params: RequestParams = {}) =>
    this.request<GetComprehensiveAnalyticsData, GetComprehensiveAnalyticsError>({
      path: `/routes/analytics/${cik}`,
      method: "GET",
      ...params,
    });

  /**
   * @description List all how-to guides
   *
   * @tags how-to-guides, dbtn/module:howto_guides
   * @name list_howto_guides
   * @summary List Howto Guides
   * @request GET:/routes/guides
   */
  list_howto_guides = (params: RequestParams = {}) =>
    this.request<ListHowtoGuidesData, any>({
      path: `/routes/guides`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get a specific how-to guide
   *
   * @tags how-to-guides, dbtn/module:howto_guides
   * @name get_howto_guide
   * @summary Get Howto Guide
   * @request GET:/routes/guides/{guide_id}
   */
  get_howto_guide = ({ guideId, ...query }: GetHowtoGuideParams, params: RequestParams = {}) =>
    this.request<GetHowtoGuideData, GetHowtoGuideError>({
      path: `/routes/guides/${guideId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new support ticket
   *
   * @tags support, dbtn/module:support
   * @name create_ticket
   * @summary Create Ticket
   * @request POST:/routes/support/tickets
   */
  create_ticket = (data: BodyCreateTicket, params: RequestParams = {}) =>
    this.request<CreateTicketData, CreateTicketError>({
      path: `/routes/support/tickets`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all tickets or filter by status
   *
   * @tags support, dbtn/module:support
   * @name list_tickets
   * @summary List Tickets
   * @request GET:/routes/support/tickets
   */
  list_tickets = (query: ListTicketsParams, data: ListTicketsPayload, params: RequestParams = {}) =>
    this.request<ListTicketsData, ListTicketsError>({
      path: `/routes/support/tickets`,
      method: "GET",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a specific ticket
   *
   * @tags support, dbtn/module:support
   * @name get_ticket
   * @summary Get Ticket
   * @request GET:/routes/support/tickets/{ticket_id}
   */
  get_ticket = ({ ticketId, ...query }: GetTicketParams, data: GetTicketPayload, params: RequestParams = {}) =>
    this.request<GetTicketData, GetTicketError>({
      path: `/routes/support/tickets/${ticketId}`,
      method: "GET",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update a ticket
   *
   * @tags support, dbtn/module:support
   * @name update_ticket
   * @summary Update Ticket
   * @request PUT:/routes/support/tickets/{ticket_id}
   */
  update_ticket = ({ ticketId, ...query }: UpdateTicketParams, data: BodyUpdateTicket, params: RequestParams = {}) =>
    this.request<UpdateTicketData, UpdateTicketError>({
      path: `/routes/support/tickets/${ticketId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Add an attachment to a ticket Args: ticket_id: ID of the ticket to attach file to file: Base64 encoded file content token: Authentication token Returns: Updated ticket with new attachment Raises: HTTPException: If file is invalid or too large
   *
   * @tags support, dbtn/module:support
   * @name add_attachment
   * @summary Add Attachment
   * @request POST:/routes/support/tickets/{ticket_id}/attachments
   */
  add_attachment = (
    { ticketId, ...query }: AddAttachmentParams,
    data: AddAttachmentPayload,
    params: RequestParams = {},
  ) =>
    this.request<AddAttachmentData, AddAttachmentError>({
      path: `/routes/support/tickets/${ticketId}/attachments`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Search for potential investors across multiple data sources - Uses efficient caching with compression - Implements batch processing for API calls - Optimizes memory usage - Provides cache hit/miss metrics - Implements progress tracking
   *
   * @tags AI List Builder, dbtn/module:ai_list_builder
   * @name search_investors
   * @summary Search Investors
   * @request POST:/routes/ai_list_builder/search
   */
  search_investors = (data: AppApisAiListBuilderSearchFilters, params: RequestParams = {}) =>
    this.request<SearchInvestorsData, SearchInvestorsError>({
      path: `/routes/ai_list_builder/search`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get the status of each data source
   *
   * @tags AI List Builder, dbtn/module:ai_list_builder
   * @name get_source_status
   * @summary Get Source Status
   * @request GET:/routes/ai_list_builder/sources/status
   */
  get_source_status = (params: RequestParams = {}) =>
    this.request<GetSourceStatusData, any>({
      path: `/routes/ai_list_builder/sources/status`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get distribution of investment focus areas
   *
   * @tags AI List Builder, dbtn/module:ai_list_builder
   * @name get_investment_focus_distribution
   * @summary Get Investment Focus Distribution
   * @request GET:/routes/ai_list_builder/analytics/investment-focus
   */
  get_investment_focus_distribution = (params: RequestParams = {}) =>
    this.request<GetInvestmentFocusDistributionData, any>({
      path: `/routes/ai_list_builder/analytics/investment-focus`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get distribution of fund sizes
   *
   * @tags AI List Builder, dbtn/module:ai_list_builder
   * @name get_fund_size_distribution
   * @summary Get Fund Size Distribution
   * @request GET:/routes/ai_list_builder/analytics/fund-size
   */
  get_fund_size_distribution = (params: RequestParams = {}) =>
    this.request<GetFundSizeDistributionData, any>({
      path: `/routes/ai_list_builder/analytics/fund-size`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get historical performance trends
   *
   * @tags AI List Builder, dbtn/module:ai_list_builder
   * @name get_historical_performance
   * @summary Get Historical Performance
   * @request GET:/routes/ai_list_builder/analytics/historical-performance
   */
  get_historical_performance = (params: RequestParams = {}) =>
    this.request<GetHistoricalPerformanceData, any>({
      path: `/routes/ai_list_builder/analytics/historical-performance`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get distribution of risk profiles
   *
   * @tags AI List Builder, dbtn/module:ai_list_builder
   * @name get_risk_profile_distribution
   * @summary Get Risk Profile Distribution
   * @request GET:/routes/ai_list_builder/analytics/risk-profile
   */
  get_risk_profile_distribution = (params: RequestParams = {}) =>
    this.request<GetRiskProfileDistributionData, any>({
      path: `/routes/ai_list_builder/analytics/risk-profile`,
      method: "GET",
      ...params,
    });

  /**
   * @description Manually trigger a refresh of all data sources
   *
   * @tags AI List Builder, dbtn/module:ai_list_builder
   * @name refresh_data
   * @summary Refresh Data
   * @request POST:/routes/ai_list_builder/refresh
   */
  refresh_data = (params: RequestParams = {}) =>
    this.request<RefreshDataData, any>({
      path: `/routes/ai_list_builder/refresh`,
      method: "POST",
      ...params,
    });

  /**
   * @description List all knowledge base articles
   *
   * @tags knowledge-base, dbtn/module:knowledge_base
   * @name list_kb_articles
   * @summary List Kb Articles
   * @request GET:/routes/kb
   */
  list_kb_articles = (params: RequestParams = {}) =>
    this.request<ListKbArticlesData, any>({
      path: `/routes/kb`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get a specific knowledge base article
   *
   * @tags knowledge-base, dbtn/module:knowledge_base
   * @name get_kb_article
   * @summary Get Kb Article
   * @request GET:/routes/kb/{article_id}
   */
  get_kb_article = ({ articleId, ...query }: GetKbArticleParams, params: RequestParams = {}) =>
    this.request<GetKbArticleData, GetKbArticleError>({
      path: `/routes/kb/${articleId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Search knowledge base articles based on query
   *
   * @tags knowledge-base, dbtn/module:knowledge_base
   * @name search_kb_articles
   * @summary Search Kb Articles
   * @request GET:/routes/kb/search/{search_query}
   */
  search_kb_articles = ({ searchQuery, ...query }: SearchKbArticlesParams, params: RequestParams = {}) =>
    this.request<SearchKbArticlesData, SearchKbArticlesError>({
      path: `/routes/kb/search/${searchQuery}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get entity details from Crunchbase
   *
   * @tags dbtn/module:crunchbase_integration
   * @name get_entity
   * @summary Get Entity
   * @request GET:/routes/entity/{entity_id}
   */
  get_entity = ({ entityId, ...query }: GetEntityParams, params: RequestParams = {}) =>
    this.request<GetEntityData, GetEntityError>({
      path: `/routes/entity/${entityId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Search for entities in Crunchbase
   *
   * @tags dbtn/module:crunchbase_integration
   * @name search_entities
   * @summary Search Entities
   * @request GET:/routes/search/{search_query}
   */
  search_entities = ({ searchQuery, ...query }: SearchEntitiesParams, params: RequestParams = {}) =>
    this.request<SearchEntitiesData, SearchEntitiesError>({
      path: `/routes/search/${searchQuery}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a test payment This endpoint simulates payment processing with different test cards and scenarios. Use specific test card numbers to trigger different payment outcomes.
   *
   * @tags dbtn/module:test_payments
   * @name create_test_payment
   * @summary Create Test Payment
   * @request POST:/routes/test-payments/create
   */
  create_test_payment = (data: CreateTestPaymentRequest, params: RequestParams = {}) =>
    this.request<CreateTestPaymentData, CreateTestPaymentError>({
      path: `/routes/test-payments/create`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a specific test payment
   *
   * @tags dbtn/module:test_payments
   * @name get_test_payment
   * @summary Get Test Payment
   * @request GET:/routes/test-payments/{payment_id}
   */
  get_test_payment = ({ paymentId, ...query }: GetTestPaymentParams, params: RequestParams = {}) =>
    this.request<GetTestPaymentData, GetTestPaymentError>({
      path: `/routes/test-payments/${paymentId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description List all test payments
   *
   * @tags dbtn/module:test_payments
   * @name list_test_payments
   * @summary List Test Payments
   * @request GET:/routes/test-payments
   */
  list_test_payments = (params: RequestParams = {}) =>
    this.request<ListTestPaymentsData, any>({
      path: `/routes/test-payments`,
      method: "GET",
      ...params,
    });

  /**
   * @description Calculate commission based on structure and inputs Args: structure_id: ID of commission structure to use base_amount: Base amount to calculate commission on metrics: Optional performance metrics volume: Optional volume for volume-based calculations Returns: CommissionCalculation with detailed breakdown Raises: HTTPException: If structure not found or calculation fails
   *
   * @tags dbtn/module:commission_calculator
   * @name calculate_commission
   * @summary Calculate Commission
   * @request POST:/routes/commission/calculate
   */
  calculate_commission = (
    query: CalculateCommissionParams,
    data: CalculateCommissionPayload,
    params: RequestParams = {},
  ) =>
    this.request<CalculateCommissionData, CalculateCommissionError>({
      path: `/routes/commission/calculate`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a new commission structure Args: structure: Commission structure to create Returns: Created commission structure Raises: HTTPException: If creation fails
   *
   * @tags dbtn/module:commission_calculator
   * @name create_commission_structure
   * @summary Create Commission Structure
   * @request POST:/routes/commission/structures/create
   */
  create_commission_structure = (data: CommissionStructure, params: RequestParams = {}) =>
    this.request<CreateCommissionStructureData, CreateCommissionStructureError>({
      path: `/routes/commission/structures/create`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a specific commission structure Args: structure_id: ID of structure to retrieve Returns: Commission structure Raises: HTTPException: If structure not found
   *
   * @tags dbtn/module:commission_calculator
   * @name get_commission_structure
   * @summary Get Commission Structure
   * @request GET:/routes/commission/structures/{structure_id}
   */
  get_commission_structure = ({ structureId, ...query }: GetCommissionStructureParams, params: RequestParams = {}) =>
    this.request<GetCommissionStructureData, GetCommissionStructureError>({
      path: `/routes/commission/structures/${structureId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update an existing commission structure Args: structure_id: ID of structure to update updates: Updated commission structure Returns: Updated commission structure Raises: HTTPException: If update fails
   *
   * @tags dbtn/module:commission_calculator
   * @name update_commission_structure
   * @summary Update Commission Structure
   * @request PUT:/routes/commission/structures/{structure_id}
   */
  update_commission_structure = (
    { structureId, ...query }: UpdateCommissionStructureParams,
    data: CommissionStructure,
    params: RequestParams = {},
  ) =>
    this.request<UpdateCommissionStructureData, UpdateCommissionStructureError>({
      path: `/routes/commission/structures/${structureId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all commission structures Args: include_inactive: Whether to include inactive structures Returns: List of commission structures
   *
   * @tags dbtn/module:commission_calculator
   * @name list_commission_structures
   * @summary List Commission Structures
   * @request GET:/routes/commission/structures
   */
  list_commission_structures = (query: ListCommissionStructuresParams, params: RequestParams = {}) =>
    this.request<ListCommissionStructuresData, ListCommissionStructuresError>({
      path: `/routes/commission/structures`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Create a new introduction request
   *
   * @tags dbtn/module:introductions
   * @name create_introduction
   * @summary Create Introduction
   * @request POST:/routes/introductions
   */
  create_introduction = (data: AppApisIntroductionsIntroductionRequest, params: RequestParams = {}) =>
    this.request<CreateIntroductionData, CreateIntroductionError>({
      path: `/routes/introductions`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get details of a specific introduction
   *
   * @tags dbtn/module:introductions
   * @name get_introduction
   * @summary Get Introduction
   * @request GET:/routes/introductions/{intro_id}
   */
  get_introduction = ({ introId, ...query }: GetIntroductionParams, params: RequestParams = {}) =>
    this.request<GetIntroductionData, GetIntroductionError>({
      path: `/routes/introductions/${introId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update the status of an introduction
   *
   * @tags dbtn/module:introductions
   * @name update_introduction_status
   * @summary Update Introduction Status
   * @request PATCH:/routes/introductions/{intro_id}
   */
  update_introduction_status = (
    { introId, ...query }: UpdateIntroductionStatusParams,
    data: IntroductionUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateIntroductionStatusData, UpdateIntroductionStatusError>({
      path: `/routes/introductions/${introId}`,
      method: "PATCH",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all introductions for a user
   *
   * @tags dbtn/module:introductions
   * @name list_user_introductions
   * @summary List User Introductions
   * @request GET:/routes/users/{user_id}/introductions
   */
  list_user_introductions = ({ userId, ...query }: ListUserIntroductionsParams, params: RequestParams = {}) =>
    this.request<ListUserIntroductionsData, ListUserIntroductionsError>({
      path: `/routes/users/${userId}/introductions`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get just the status of an introduction
   *
   * @tags dbtn/module:introductions
   * @name get_introduction_status
   * @summary Get Introduction Status
   * @request GET:/routes/introductions/{intro_id}/status
   */
  get_introduction_status = ({ introId, ...query }: GetIntroductionStatusParams, params: RequestParams = {}) =>
    this.request<GetIntroductionStatusData, GetIntroductionStatusError>({
      path: `/routes/introductions/${introId}/status`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get the requirements and benefits for each tier
   *
   * @tags dbtn/module:tier_progression
   * @name get_tier_requirements
   * @summary Get Tier Requirements
   * @request GET:/routes/tier-requirements
   */
  get_tier_requirements = (params: RequestParams = {}) =>
    this.request<GetTierRequirementsData, any>({
      path: `/routes/tier-requirements`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get current tier status and progression for a user
   *
   * @tags dbtn/module:tier_progression
   * @name get_tier_status
   * @summary Get Tier Status
   * @request GET:/routes/tier-status/{user_id}
   */
  get_tier_status = ({ userId, ...query }: GetTierStatusParams, params: RequestParams = {}) =>
    this.request<GetTierStatusData, GetTierStatusError>({
      path: `/routes/tier-status/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Calculate and update user's tier based on their performance
   *
   * @tags dbtn/module:tier_progression
   * @name calculate_tier
   * @summary Calculate Tier
   * @request POST:/routes/calculate-tier/{user_id}
   */
  calculate_tier = ({ userId, ...query }: CalculateTierParams, params: RequestParams = {}) =>
    this.request<CalculateTierData, CalculateTierError>({
      path: `/routes/calculate-tier/${userId}`,
      method: "POST",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:referral
   * @name create_referral_code
   * @summary Create Referral Code
   * @request POST:/routes/referral/create-code
   */
  create_referral_code = (query: CreateReferralCodeParams, params: RequestParams = {}) =>
    this.request<CreateReferralCodeData, CreateReferralCodeError>({
      path: `/routes/referral/create-code`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Get all referral links for a user
   *
   * @tags dbtn/module:referral
   * @name get_referral_links
   * @summary Get Referral Links
   * @request GET:/routes/referral/get-links/{user_id}
   */
  get_referral_links = ({ userId, ...query }: GetReferralLinksParams, params: RequestParams = {}) =>
    this.request<GetReferralLinksData, GetReferralLinksError>({
      path: `/routes/referral/get-links/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Track a visit to a referral link
   *
   * @tags dbtn/module:referral
   * @name track_referral_visit
   * @summary Track Referral Visit
   * @request POST:/routes/referral/track-visit
   */
  track_referral_visit = (query: TrackReferralVisitParams, params: RequestParams = {}) =>
    this.request<TrackReferralVisitData, TrackReferralVisitError>({
      path: `/routes/referral/track-visit`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Process commission payment for an affiliate
   *
   * @tags dbtn/module:referral
   * @name process_commission_payment
   * @summary Process Commission Payment
   * @request POST:/routes/referral/process-commission-payment/{affiliate_id}
   */
  process_commission_payment = (
    { affiliateId, ...query }: ProcessCommissionPaymentParams,
    params: RequestParams = {},
  ) =>
    this.request<ProcessCommissionPaymentData, ProcessCommissionPaymentError>({
      path: `/routes/referral/process-commission-payment/${affiliateId}`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Get commission payment history for an affiliate
   *
   * @tags dbtn/module:referral
   * @name get_commission_payments
   * @summary Get Commission Payments
   * @request GET:/routes/referral/get-commission-payments/{affiliate_id}
   */
  get_commission_payments = ({ affiliateId, ...query }: GetCommissionPaymentsParams, params: RequestParams = {}) =>
    this.request<GetCommissionPaymentsData, GetCommissionPaymentsError>({
      path: `/routes/referral/get-commission-payments/${affiliateId}`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:referral
   * @name track_referral
   * @summary Track Referral
   * @request POST:/routes/referral/track-referral
   */
  track_referral = (query: TrackReferralParams, params: RequestParams = {}) =>
    this.request<TrackReferralData, TrackReferralError>({
      path: `/routes/referral/track-referral`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:referral
   * @name convert_referral
   * @summary Convert Referral
   * @request POST:/routes/referral/convert-referral/{tracking_id}
   */
  convert_referral = ({ trackingId, ...query }: ConvertReferralParams, params: RequestParams = {}) =>
    this.request<ConvertReferralData, ConvertReferralError>({
      path: `/routes/referral/convert-referral/${trackingId}`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:referral
   * @name activate_affiliate
   * @summary Activate Affiliate
   * @request POST:/routes/referral/activate-affiliate
   */
  activate_affiliate = (query: ActivateAffiliateParams, params: RequestParams = {}) =>
    this.request<ActivateAffiliateData, ActivateAffiliateError>({
      path: `/routes/referral/activate-affiliate`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Get affiliate status for a user Args: user_id: ID of the user Returns: Current affiliate status
   *
   * @tags dbtn/module:referral
   * @name get_affiliate_status_endpoint
   * @summary Get Affiliate Status Endpoint
   * @request GET:/routes/referral/get-affiliate-status/{user_id}
   */
  get_affiliate_status_endpoint = (
    { userId, ...query }: GetAffiliateStatusEndpointParams,
    params: RequestParams = {},
  ) =>
    this.request<GetAffiliateStatusEndpointData, GetAffiliateStatusEndpointError>({
      path: `/routes/referral/get-affiliate-status/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update affiliate settings for a user Args: user_id: ID of the user settings: New settings to apply Returns: Updated settings Raises: HTTPException: If settings cannot be updated
   *
   * @tags dbtn/module:referral
   * @name update_affiliate_settings
   * @summary Update Affiliate Settings
   * @request POST:/routes/referral/update-settings/{user_id}
   */
  update_affiliate_settings = (
    { userId, ...query }: UpdateAffiliateSettingsParams,
    data: UpdateAffiliateSettingsPayload,
    params: RequestParams = {},
  ) =>
    this.request<UpdateAffiliateSettingsData, UpdateAffiliateSettingsError>({
      path: `/routes/referral/update-settings/${userId}`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get affiliate settings for a user Args: user_id: ID of the user Returns: Current affiliate settings
   *
   * @tags dbtn/module:referral
   * @name get_affiliate_settings_endpoint
   * @summary Get Affiliate Settings Endpoint
   * @request GET:/routes/referral/get-settings/{user_id}
   */
  get_affiliate_settings_endpoint = (
    { userId, ...query }: GetAffiliateSettingsEndpointParams,
    params: RequestParams = {},
  ) =>
    this.request<GetAffiliateSettingsEndpointData, GetAffiliateSettingsEndpointError>({
      path: `/routes/referral/get-settings/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get all referral relationships for a user
   *
   * @tags dbtn/module:referral
   * @name get_relationships
   * @summary Get Relationships
   * @request GET:/routes/referral/get-relationships/{user_id}
   */
  get_relationships = ({ userId, ...query }: GetRelationshipsParams, params: RequestParams = {}) =>
    this.request<GetRelationshipsData, GetRelationshipsError>({
      path: `/routes/referral/get-relationships/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:referral
   * @name get_referral_stats
   * @summary Get Referral Stats
   * @request GET:/routes/referral/get-referral-stats/{user_id}
   */
  get_referral_stats = ({ userId, ...query }: GetReferralStatsParams, params: RequestParams = {}) =>
    this.request<GetReferralStatsData, GetReferralStatsError>({
      path: `/routes/referral/get-referral-stats/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Send a message endpoint
   *
   * @tags dbtn/module:messaging_enhanced
   * @name send_message_endpoint
   * @summary Send Message Endpoint
   * @request POST:/routes/messages/send
   */
  send_message_endpoint = (data: BodySendMessageEndpoint, params: RequestParams = {}) =>
    this.request<SendMessageEndpointData, SendMessageEndpointError>({
      path: `/routes/messages/send`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Toggle mute status for a thread
   *
   * @tags dbtn/module:messaging_enhanced
   * @name toggle_thread_mute
   * @summary Toggle Thread Mute
   * @request POST:/routes/messages/threads/{thread_id}/mute
   */
  toggle_thread_mute = (
    { threadId, ...query }: ToggleThreadMuteParams,
    data: AppApisAuthUtilsTokenRequest,
    params: RequestParams = {},
  ) =>
    this.request<ToggleThreadMuteData, ToggleThreadMuteError>({
      path: `/routes/messages/threads/${threadId}/mute`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Mark a thread as read or unread
   *
   * @tags dbtn/module:messaging_enhanced
   * @name mark_thread_read_status
   * @summary Mark Thread Read Status
   * @request POST:/routes/messages/threads/{thread_id}/read
   */
  mark_thread_read_status = (
    { threadId, ...query }: MarkThreadReadStatusParams,
    data: AppApisAuthUtilsTokenRequest,
    params: RequestParams = {},
  ) =>
    this.request<MarkThreadReadStatusData, MarkThreadReadStatusError>({
      path: `/routes/messages/threads/${threadId}/read`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get messages between current user and another user with enhanced thread support
   *
   * @tags dbtn/module:messaging_enhanced
   * @name get_messages
   * @summary Get Messages
   * @request GET:/routes/messages/{other_user_id}
   */
  get_messages = (
    { otherUserId, ...query }: GetMessagesParams,
    data: AppApisAuthUtilsTokenRequest,
    params: RequestParams = {},
  ) =>
    this.request<GetMessagesData, GetMessagesError>({
      path: `/routes/messages/${otherUserId}`,
      method: "GET",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update typing indicator with automatic cleanup
   *
   * @tags dbtn/module:messaging_enhanced
   * @name update_typing_indicator
   * @summary Update Typing Indicator
   * @request POST:/routes/messages/typing
   */
  update_typing_indicator = (data: BodyUpdateTypingIndicator, params: RequestParams = {}) =>
    this.request<UpdateTypingIndicatorData, UpdateTypingIndicatorError>({
      path: `/routes/messages/typing`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get typing status for a user
   *
   * @tags dbtn/module:messaging_enhanced
   * @name get_typing_status
   * @summary Get Typing Status
   * @request GET:/routes/messages/typing/{other_user_id}
   */
  get_typing_status = (
    { otherUserId, ...query }: GetTypingStatusParams,
    data: AppApisAuthUtilsTokenRequest,
    params: RequestParams = {},
  ) =>
    this.request<GetTypingStatusData, GetTypingStatusError>({
      path: `/routes/messages/typing/${otherUserId}`,
      method: "GET",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all conversations for the current user
   *
   * @tags dbtn/module:messaging_enhanced
   * @name get_conversations
   * @summary Get Conversations
   * @request GET:/routes/conversations
   */
  get_conversations = (data: AppApisAuthUtilsTokenRequest, params: RequestParams = {}) =>
    this.request<GetConversationsData, GetConversationsError>({
      path: `/routes/conversations`,
      method: "GET",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all relationships for a user
   *
   * @tags relationships, dbtn/module:relationship_management
   * @name get_user_relationships
   * @summary Get User Relationships
   * @request GET:/routes/relationship/get-user-relationships/{user_id}
   */
  get_user_relationships = ({ userId, ...query }: GetUserRelationshipsParams, params: RequestParams = {}) =>
    this.request<GetUserRelationshipsData, GetUserRelationshipsError>({
      path: `/routes/relationship/get-user-relationships/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get details of a specific relationship
   *
   * @tags relationships, dbtn/module:relationship_management
   * @name get_relationship
   * @summary Get Relationship
   * @request GET:/routes/relationship/get-relationship/{relationship_id}
   */
  get_relationship = ({ relationshipId, ...query }: GetRelationshipParams, params: RequestParams = {}) =>
    this.request<GetRelationshipData, GetRelationshipError>({
      path: `/routes/relationship/get-relationship/${relationshipId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new relationship between users
   *
   * @tags relationships, dbtn/module:relationship_management
   * @name create_relationship
   * @summary Create Relationship
   * @request POST:/routes/relationship/create-relationship
   */
  create_relationship = (data: Relationship, params: RequestParams = {}) =>
    this.request<CreateRelationshipData, CreateRelationshipError>({
      path: `/routes/relationship/create-relationship`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update the status of a relationship
   *
   * @tags relationships, dbtn/module:relationship_management
   * @name update_relationship_status
   * @summary Update Relationship Status
   * @request PUT:/routes/relationship/update-relationship-status/{relationship_id}
   */
  update_relationship_status = (
    { relationshipId, ...query }: UpdateRelationshipStatusParams,
    params: RequestParams = {},
  ) =>
    this.request<UpdateRelationshipStatusData, UpdateRelationshipStatusError>({
      path: `/routes/relationship/update-relationship-status/${relationshipId}`,
      method: "PUT",
      query: query,
      ...params,
    });

  /**
   * @description Calculate relationship strength between two users Factors considered: - Number of successful introductions - Average response time to introduction requests - Quality score based on feedback - Frequency of interactions Returns: StrengthScore with overall score and breakdown
   *
   * @tags relationships, dbtn/module:relationship_management
   * @name get_relationship_strength_v1
   * @summary Get Relationship Strength V1
   * @request GET:/routes/relationship/get-relationship-strength/{user1_id}/{user2_id}
   */
  get_relationship_strength_v1 = (
    { user1Id, user2Id, ...query }: GetRelationshipStrengthV1Params,
    params: RequestParams = {},
  ) =>
    this.request<GetRelationshipStrengthV1Data, GetRelationshipStrengthV1Error>({
      path: `/routes/relationship/get-relationship-strength/${user1Id}/${user2Id}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get relationship strength scores for user's entire network Returns: Dict mapping user_ids to strength scores
   *
   * @tags relationships, dbtn/module:relationship_management
   * @name get_network_strength
   * @summary Get Network Strength
   * @request GET:/routes/relationship/get-network-strength/{user_id}
   */
  get_network_strength = ({ userId, ...query }: GetNetworkStrengthParams, params: RequestParams = {}) =>
    this.request<GetNetworkStrengthData, GetNetworkStrengthError>({
      path: `/routes/relationship/get-network-strength/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Record a new interaction in a relationship
   *
   * @tags relationships, dbtn/module:relationship_management
   * @name record_interaction
   * @summary Record Interaction
   * @request POST:/routes/relationship/record-interaction/{relationship_id}
   */
  record_interaction = (
    { relationshipId, ...query }: RecordInteractionParams,
    data: Interaction,
    params: RequestParams = {},
  ) =>
    this.request<RecordInteractionData, RecordInteractionError>({
      path: `/routes/relationship/record-interaction/${relationshipId}`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Calculate relationship strength between two users Factors considered: - Number of successful introductions - Average response time to introduction requests - Quality score based on feedback - Frequency of interactions Returns: StrengthScore with overall score and breakdown
   *
   * @tags dbtn/module:relationship_strength
   * @name calculate_relationship_strength
   * @summary Calculate Relationship Strength
   * @request GET:/routes/strength/calculate/{user1_id}/{user2_id}
   */
  calculate_relationship_strength = (
    { user1Id, user2Id, ...query }: CalculateRelationshipStrengthParams,
    params: RequestParams = {},
  ) =>
    this.request<CalculateRelationshipStrengthData, CalculateRelationshipStrengthError>({
      path: `/routes/strength/calculate/${user1Id}/${user2Id}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get relationship strength scores for user's entire network Returns: Dict mapping user_ids to strength scores
   *
   * @tags dbtn/module:relationship_strength
   * @name calculate_network_strength
   * @summary Calculate Network Strength
   * @request GET:/routes/strength/network/{user_id}
   */
  calculate_network_strength = ({ userId, ...query }: CalculateNetworkStrengthParams, params: RequestParams = {}) =>
    this.request<CalculateNetworkStrengthData, CalculateNetworkStrengthError>({
      path: `/routes/strength/network/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Upload a file attachment with improved validation and error handling
   *
   * @tags dbtn/module:attachments
   * @name upload_attachment
   * @summary Upload Attachment
   * @request POST:/routes/attachments/upload
   */
  upload_attachment = (data: BodyUploadAttachment, params: RequestParams = {}) =>
    this.request<UploadAttachmentData, UploadAttachmentError>({
      path: `/routes/attachments/upload`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Download a file attachment
   *
   * @tags dbtn/module:attachments
   * @name download_attachment
   * @summary Download Attachment
   * @request GET:/routes/attachments/{attachment_id}/download
   */
  download_attachment = (
    { attachmentId, ...query }: DownloadAttachmentParams,
    data: AppApisAuthUtilsTokenRequest,
    params: RequestParams = {},
  ) =>
    this.request<DownloadAttachmentData, DownloadAttachmentError>({
      path: `/routes/attachments/${attachmentId}/download`,
      method: "GET",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Upload a new document
   *
   * @tags dbtn/module:document_management
   * @name upload_document
   * @summary Upload Document
   * @request POST:/routes/documents/upload
   */
  upload_document = (query: UploadDocumentParams, data: BodyUploadDocument, params: RequestParams = {}) =>
    this.request<UploadDocumentData, UploadDocumentError>({
      path: `/routes/documents/upload`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * @description Download a document
   *
   * @tags dbtn/module:document_management
   * @name get_document
   * @summary Get Document
   * @request GET:/routes/documents/{document_id}
   */
  get_document = ({ documentId, ...query }: GetDocumentParams, params: RequestParams = {}) =>
    this.request<GetDocumentData, GetDocumentError>({
      path: `/routes/documents/${documentId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Delete a document
   *
   * @tags dbtn/module:document_management
   * @name delete_document
   * @summary Delete Document
   * @request DELETE:/routes/documents/{document_id}
   */
  delete_document = ({ documentId, ...query }: DeleteDocumentParams, params: RequestParams = {}) =>
    this.request<DeleteDocumentData, DeleteDocumentError>({
      path: `/routes/documents/${documentId}`,
      method: "DELETE",
      query: query,
      ...params,
    });

  /**
   * @description Share document with other users
   *
   * @tags dbtn/module:document_management
   * @name share_document
   * @summary Share Document
   * @request POST:/routes/documents/{document_id}/share
   */
  share_document = (
    { documentId, ...query }: ShareDocumentParams,
    data: ShareDocumentPayload,
    params: RequestParams = {},
  ) =>
    this.request<ShareDocumentData, ShareDocumentError>({
      path: `/routes/documents/${documentId}/share`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all documents accessible to user
   *
   * @tags dbtn/module:document_management
   * @name list_documents
   * @summary List Documents
   * @request GET:/routes/documents
   */
  list_documents = (query: ListDocumentsParams, params: RequestParams = {}) =>
    this.request<ListDocumentsData, ListDocumentsError>({
      path: `/routes/documents`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a specific version of a document
   *
   * @tags dbtn/module:document_management
   * @name get_document_version
   * @summary Get Document Version
   * @request GET:/routes/documents/{document_id}/versions/{version}
   */
  get_document_version = ({ documentId, version, ...query }: GetDocumentVersionParams, params: RequestParams = {}) =>
    this.request<GetDocumentVersionData, GetDocumentVersionError>({
      path: `/routes/documents/${documentId}/versions/${version}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get all versions of a document
   *
   * @tags dbtn/module:document_management
   * @name get_document_versions
   * @summary Get Document Versions
   * @request GET:/routes/documents/{document_id}/versions
   */
  get_document_versions = ({ documentId, ...query }: GetDocumentVersionsParams, params: RequestParams = {}) =>
    this.request<GetDocumentVersionsData, GetDocumentVersionsError>({
      path: `/routes/documents/${documentId}/versions`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Restore a document to a previous version
   *
   * @tags dbtn/module:document_management
   * @name restore_document_version
   * @summary Restore Document Version
   * @request POST:/routes/documents/{document_id}/restore/{version}
   */
  restore_document_version = (
    { documentId, version, ...query }: RestoreDocumentVersionParams,
    params: RequestParams = {},
  ) =>
    this.request<RestoreDocumentVersionData, RestoreDocumentVersionError>({
      path: `/routes/documents/${documentId}/restore/${version}`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Get user's storage quota and usage
   *
   * @tags dbtn/module:document_management
   * @name get_quota
   * @summary Get Quota
   * @request GET:/routes/quota
   */
  get_quota = (query: GetQuotaParams, params: RequestParams = {}) =>
    this.request<GetQuotaData, GetQuotaError>({
      path: `/routes/quota`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:admin
   * @name update_user_role
   * @summary Update User Role
   * @request POST:/routes/admin/users/role
   */
  update_user_role = (data: UpdateUserRoleRequest, params: RequestParams = {}) =>
    this.request<UpdateUserRoleData, UpdateUserRoleError>({
      path: `/routes/admin/users/role`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:admin
   * @name update_user_status
   * @summary Update User Status
   * @request POST:/routes/admin/users/status
   */
  update_user_status = (data: UpdateUserStatusRequest, params: RequestParams = {}) =>
    this.request<UpdateUserStatusData, UpdateUserStatusError>({
      path: `/routes/admin/users/status`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:admin
   * @name list_admin_users
   * @summary List Admin Users
   * @request POST:/routes/admin/users/list
   */
  list_admin_users = (data: ListAdminUsersPayload, params: RequestParams = {}) =>
    this.request<ListAdminUsersData, ListAdminUsersError>({
      path: `/routes/admin/users/list`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:admin
   * @name get_admin_role_permissions
   * @summary Get Admin Role Permissions
   * @request GET:/routes/permissions
   */
  get_admin_role_permissions = (data: GetAdminRolePermissionsPayload, params: RequestParams = {}) =>
    this.request<GetAdminRolePermissionsData, GetAdminRolePermissionsError>({
      path: `/routes/permissions`,
      method: "GET",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get permission structure for roles This endpoint provides role-based permissions data that the frontend uses to determine which features are available to each user role. Returns detailed permission structures for all roles, as well as backward-compatible routes and features dictionaries.
   *
   * @tags routes, dbtn/module:routes
   * @name get_permissions
   * @summary Get Permissions
   * @request POST:/routes/permissions
   */
  get_permissions = (data: GetPermissionsPayload, params: RequestParams = {}) =>
    this.request<GetPermissionsData, GetPermissionsError>({
      path: `/routes/permissions`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:admin
   * @name get_admin_audit_logs
   * @summary Get Admin Audit Logs
   * @request GET:/routes/admin/audit-logs
   */
  get_admin_audit_logs = (query: GetAdminAuditLogsParams, data: GetAdminAuditLogsPayload, params: RequestParams = {}) =>
    this.request<GetAdminAuditLogsData, GetAdminAuditLogsError>({
      path: `/routes/admin/audit-logs`,
      method: "GET",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a new Stripe Connect account This endpoint will: 1. Create a Connect account in Stripe 2. Store the account details locally 3. Generate an onboarding URL if needed 4. Return the account details and onboarding URL
   *
   * @tags dbtn/module:stripe_connect
   * @name create_connect_account
   * @summary Create Connect Account
   * @request POST:/routes/stripe/connect/create-account
   */
  create_connect_account = (data: CreateConnectAccountRequest, params: RequestParams = {}) =>
    this.request<CreateConnectAccountData, CreateConnectAccountError>({
      path: `/routes/stripe/connect/create-account`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a specific Connect account
   *
   * @tags dbtn/module:stripe_connect
   * @name get_connect_account
   * @summary Get Connect Account
   * @request GET:/routes/stripe/connect/account/{account_id}
   */
  get_connect_account = ({ accountId, ...query }: GetConnectAccountParams, params: RequestParams = {}) =>
    this.request<GetConnectAccountData, GetConnectAccountError>({
      path: `/routes/stripe/connect/account/${accountId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get all Connect accounts for a user
   *
   * @tags dbtn/module:stripe_connect
   * @name get_user_connect_accounts
   * @summary Get User Connect Accounts
   * @request GET:/routes/stripe/connect/accounts/user/{user_id}
   */
  get_user_connect_accounts = ({ userId, ...query }: GetUserConnectAccountsParams, params: RequestParams = {}) =>
    this.request<GetUserConnectAccountsData, GetUserConnectAccountsError>({
      path: `/routes/stripe/connect/accounts/user/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a payout to a Connect account This endpoint will: 1. Verify the Connect account exists and is enabled 2. Create a payout in Stripe 3. Return the payout details
   *
   * @tags dbtn/module:stripe_connect
   * @name create_payout
   * @summary Create Payout
   * @request POST:/routes/stripe/connect/payout
   */
  create_payout = (data: PayoutRequest, params: RequestParams = {}) =>
    this.request<CreatePayoutData, CreatePayoutError>({
      path: `/routes/stripe/connect/payout`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Import contacts and automatically assign the uploader as lead owner
   *
   * @tags contacts, dbtn/module:contacts
   * @name import_contacts
   * @summary Import Contacts
   * @request POST:/routes/contacts/import
   */
  import_contacts = (data: ImportContactsRequest, params: RequestParams = {}) =>
    this.request<ImportContactsData, ImportContactsError>({
      path: `/routes/contacts/import`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags contacts, dbtn/module:contacts
   * @name list_contacts
   * @summary List Contacts
   * @request GET:/routes/contacts/list
   */
  list_contacts = (data: AppApisModelsTokenRequest, params: RequestParams = {}) =>
    this.request<ListContactsData, ListContactsError>({
      path: `/routes/contacts/list`,
      method: "GET",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags contacts, dbtn/module:contacts
   * @name get_contact_matches
   * @summary Get Contact Matches
   * @request POST:/routes/contact-matches
   */
  get_contact_matches = (data: AppApisModelsTokenRequest, params: RequestParams = {}) =>
    this.request<GetContactMatchesData, GetContactMatchesError>({
      path: `/routes/contact-matches`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Request an introduction to a contact
   *
   * @tags contacts, dbtn/module:contacts
   * @name request_introduction
   * @summary Request Introduction
   * @request POST:/routes/request-introduction
   */
  request_introduction = (data: AppApisContactsIntroductionRequest, params: RequestParams = {}) =>
    this.request<RequestIntroductionData, RequestIntroductionError>({
      path: `/routes/request-introduction`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Transfer ownership of a contact to another user
   *
   * @tags contacts, dbtn/module:contacts
   * @name transfer_ownership
   * @summary Transfer Ownership
   * @request POST:/routes/contacts/transfer-ownership
   */
  transfer_ownership = (data: TransferOwnershipRequest, params: RequestParams = {}) =>
    this.request<TransferOwnershipData, TransferOwnershipError>({
      path: `/routes/contacts/transfer-ownership`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:profile
   * @name create_profile
   * @summary Create Profile
   * @request POST:/routes/profile/create-profile
   */
  create_profile = (data: CreateProfileRequest, params: RequestParams = {}) =>
    this.request<CreateProfileData, CreateProfileError>({
      path: `/routes/profile/create-profile`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Upload a profile image with validation - Validates file type (must be image) - Validates file size (max 5MB) - Stores image securely - Returns public URL for the image
   *
   * @tags dbtn/module:profile
   * @name upload_profile_image
   * @summary Upload Profile Image
   * @request POST:/routes/profile/upload-image
   */
  upload_profile_image = (data: BodyUploadProfileImage, params: RequestParams = {}) =>
    this.request<UploadProfileImageData, UploadProfileImageError>({
      path: `/routes/profile/upload-image`,
      method: "POST",
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:profile
   * @name get_profile_v1
   * @summary Get Profile V1
   * @request GET:/routes/profile/get/{user_id}
   */
  get_profile_v1 = ({ userId, ...query }: GetProfileV1Params, params: RequestParams = {}) =>
    this.request<GetProfileV1Data, GetProfileV1Error>({
      path: `/routes/profile/get/${userId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:profile
   * @name list_profiles_v1
   * @summary List Profiles V1
   * @request POST:/routes/profile/list
   */
  list_profiles_v1 = (data: ListProfilesRequest, params: RequestParams = {}) =>
    this.request<ListProfilesV1Data, ListProfilesV1Error>({
      path: `/routes/profile/list`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Store a profile in storage
   *
   * @tags dbtn/module:storage
   * @name store_profile_endpoint
   * @summary Store Profile Endpoint
   * @request POST:/routes/storage/profiles/{user_id}
   */
  store_profile_endpoint = (
    { userId, ...query }: StoreProfileEndpointParams,
    data: StoreProfileEndpointPayload,
    params: RequestParams = {},
  ) =>
    this.request<StoreProfileEndpointData, StoreProfileEndpointError>({
      path: `/routes/storage/profiles/${userId}`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a profile from storage
   *
   * @tags dbtn/module:storage
   * @name get_profile_endpoint
   * @summary Get Profile Endpoint
   * @request GET:/routes/storage/profiles/{user_id}
   */
  get_profile_endpoint = ({ userId, ...query }: GetProfileEndpointParams, params: RequestParams = {}) =>
    this.request<GetProfileEndpointData, GetProfileEndpointError>({
      path: `/routes/storage/profiles/${userId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Update a profile in storage
   *
   * @tags dbtn/module:storage
   * @name update_profile_endpoint
   * @summary Update Profile Endpoint
   * @request PUT:/routes/storage/profiles/{user_id}
   */
  update_profile_endpoint = (
    { userId, ...query }: UpdateProfileEndpointParams,
    data: UpdateProfileEndpointPayload,
    params: RequestParams = {},
  ) =>
    this.request<UpdateProfileEndpointData, UpdateProfileEndpointError>({
      path: `/routes/storage/profiles/${userId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:permissions
   * @name update_role_permissions
   * @summary Update Role Permissions
   * @request POST:/routes/update
   */
  update_role_permissions = (data: UpdateRolePermissionsRequest, params: RequestParams = {}) =>
    this.request<UpdateRolePermissionsData, UpdateRolePermissionsError>({
      path: `/routes/update`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:permissions
   * @name get_role_permissions
   * @summary Get Role Permissions
   * @request GET:/routes/list
   */
  get_role_permissions = (data: AppApisModelsTokenRequest, params: RequestParams = {}) =>
    this.request<GetRolePermissionsData, GetRolePermissionsError>({
      path: `/routes/list`,
      method: "GET",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Estimate the size of the exported data
   *
   * @tags data-export, dbtn/module:data_export
   * @name estimate_export_size
   * @summary Estimate Export Size
   * @request POST:/routes/estimate-size
   */
  estimate_export_size = (data: EstimateRequest, params: RequestParams = {}) =>
    this.request<EstimateExportSizeData, EstimateExportSizeError>({
      path: `/routes/estimate-size`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Export user data in the specified format
   *
   * @tags data-export, dbtn/module:data_export
   * @name export_user_data
   * @summary Export User Data
   * @request POST:/routes/export-data
   */
  export_user_data = (data: ExportRequest, params: RequestParams = {}) =>
    this.request<ExportUserDataData, ExportUserDataError>({
      path: `/routes/export-data`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get the progress of an export
   *
   * @tags data-export, dbtn/module:data_export
   * @name get_export_progress
   * @summary Get Export Progress
   * @request GET:/routes/export-progress/{export_id}
   */
  get_export_progress = ({ exportId, ...query }: GetExportProgressParams, params: RequestParams = {}) =>
    this.request<GetExportProgressData, GetExportProgressError>({
      path: `/routes/export-progress/${exportId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Download an exported data file
   *
   * @tags data-export, dbtn/module:data_export
   * @name download_export
   * @summary Download Export
   * @request GET:/routes/download/{export_id}
   */
  download_export = ({ exportId, ...query }: DownloadExportParams, params: RequestParams = {}) =>
    this.request<DownloadExportData, DownloadExportError>({
      path: `/routes/download/${exportId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Request a refund for a subscription payment
   *
   * @tags dbtn/module:subscription_refunds
   * @name request_refund
   * @summary Request Refund
   * @request POST:/routes/request-refund
   */
  request_refund = (data: RefundRequest, params: RequestParams = {}) =>
    this.request<RequestRefundData, RequestRefundError>({
      path: `/routes/request-refund`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Cancel a subscription with optional immediate cancellation
   *
   * @tags dbtn/module:subscription_refunds
   * @name cancel_subscription
   * @summary Cancel Subscription
   * @request POST:/routes/cancel-subscription
   */
  cancel_subscription = (data: CancellationRequest, params: RequestParams = {}) =>
    this.request<CancelSubscriptionData, CancelSubscriptionError>({
      path: `/routes/cancel-subscription`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get the status of a refund request
   *
   * @tags dbtn/module:subscription_refunds
   * @name get_refund_status
   * @summary Get Refund Status
   * @request GET:/routes/refund-status/{refund_id}
   */
  get_refund_status = ({ refundId, ...query }: GetRefundStatusParams, params: RequestParams = {}) =>
    this.request<GetRefundStatusData, GetRefundStatusError>({
      path: `/routes/refund-status/${refundId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get the status of a cancellation request
   *
   * @tags dbtn/module:subscription_refunds
   * @name get_cancellation_status
   * @summary Get Cancellation Status
   * @request GET:/routes/cancellation-status/{cancellation_id}
   */
  get_cancellation_status = ({ cancellationId, ...query }: GetCancellationStatusParams, params: RequestParams = {}) =>
    this.request<GetCancellationStatusData, GetCancellationStatusError>({
      path: `/routes/cancellation-status/${cancellationId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Health check endpoint.
   *
   * @tags utils, dbtn/module:utils
   * @name health_check
   * @summary Health Check
   * @request GET:/routes/utils/health
   */
  health_check = (params: RequestParams = {}) =>
    this.request<HealthCheckData, any>({
      path: `/routes/utils/health`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get all available enums for the frontend.
   *
   * @tags utils, dbtn/module:utils
   * @name get_enums
   * @summary Get Enums
   * @request GET:/routes/utils/enums
   */
  get_enums = (params: RequestParams = {}) =>
    this.request<GetEnumsData, any>({
      path: `/routes/utils/enums`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get storage statistics.
   *
   * @tags utils, dbtn/module:utils
   * @name get_storage_stats
   * @summary Get Storage Stats
   * @request GET:/routes/utils/storage-stats
   */
  get_storage_stats = (params: RequestParams = {}) =>
    this.request<GetStorageStatsData, any>({
      path: `/routes/utils/storage-stats`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get moderation effectiveness metrics
   *
   * @tags moderation, dbtn/module:moderation
   * @name get_moderation_metrics_v1
   * @summary Get Moderation Metrics V1
   * @request GET:/routes/metrics/v1
   */
  get_moderation_metrics_v1 = (data: AppApisModelsTokenRequest, params: RequestParams = {}) =>
    this.request<GetModerationMetricsV1Data, GetModerationMetricsV1Error>({
      path: `/routes/metrics/v1`,
      method: "GET",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags moderation, dbtn/module:moderation
   * @name get_content_reports_v1
   * @summary Get Content Reports V1
   * @request GET:/routes/moderation/reports/v1
   */
  get_content_reports_v1 = (
    query: GetContentReportsV1Params,
    data: GetContentReportsV1Payload,
    params: RequestParams = {},
  ) =>
    this.request<GetContentReportsV1Data, GetContentReportsV1Error>({
      path: `/routes/moderation/reports/v1`,
      method: "GET",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags moderation, dbtn/module:moderation
   * @name get_content_rules_v1
   * @summary Get Content Rules V1
   * @request GET:/routes/moderation/rules/v1
   */
  get_content_rules_v1 = (data: GetContentRulesV1Payload, params: RequestParams = {}) =>
    this.request<GetContentRulesV1Data, GetContentRulesV1Error>({
      path: `/routes/moderation/rules/v1`,
      method: "GET",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags moderation, dbtn/module:moderation
   * @name test_pattern_v1
   * @summary Test Pattern V1
   * @request POST:/routes/moderation/rules/test/v1
   */
  test_pattern_v1 = (data: AppApisModelsPatternTestRequest, params: RequestParams = {}) =>
    this.request<TestPatternV1Data, TestPatternV1Error>({
      path: `/routes/moderation/rules/test/v1`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags moderation, dbtn/module:moderation
   * @name add_content_rule_v1
   * @summary Add Content Rule V1
   * @request POST:/routes/moderation/rules/add/v1
   */
  add_content_rule_v1 = (data: AppApisModerationAddContentRuleRequest, params: RequestParams = {}) =>
    this.request<AddContentRuleV1Data, AddContentRuleV1Error>({
      path: `/routes/moderation/rules/add/v1`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags moderation, dbtn/module:moderation
   * @name batch_update_rules_v1
   * @summary Batch Update Rules V1
   * @request POST:/routes/moderation/rules/batch/v1
   */
  batch_update_rules_v1 = (data: BatchOperationRequest, params: RequestParams = {}) =>
    this.request<BatchUpdateRulesV1Data, BatchUpdateRulesV1Error>({
      path: `/routes/moderation/rules/batch/v1`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags moderation, dbtn/module:moderation
   * @name get_rule_effectiveness_v1
   * @summary Get Rule Effectiveness V1
   * @request GET:/routes/moderation/rules/effectiveness/v1
   */
  get_rule_effectiveness_v1 = (
    query: GetRuleEffectivenessV1Params,
    data: GetRuleEffectivenessV1Payload,
    params: RequestParams = {},
  ) =>
    this.request<GetRuleEffectivenessV1Data, GetRuleEffectivenessV1Error>({
      path: `/routes/moderation/rules/effectiveness/v1`,
      method: "GET",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags moderation, dbtn/module:moderation
   * @name update_content_rule_v1
   * @summary Update Content Rule V1
   * @request POST:/routes/moderation/rules/{rule_id}/update/v1
   */
  update_content_rule_v1 = (
    { ruleId, ...query }: UpdateContentRuleV1Params,
    data: BodyUpdateContentRuleV1,
    params: RequestParams = {},
  ) =>
    this.request<UpdateContentRuleV1Data, UpdateContentRuleV1Error>({
      path: `/routes/moderation/rules/${ruleId}/update/v1`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags moderation, dbtn/module:moderation
   * @name get_moderation_actions_v1
   * @summary Get Moderation Actions V1
   * @request GET:/routes/moderation/actions/v1
   */
  get_moderation_actions_v1 = (
    query: GetModerationActionsV1Params,
    data: GetModerationActionsV1Payload,
    params: RequestParams = {},
  ) =>
    this.request<GetModerationActionsV1Data, GetModerationActionsV1Error>({
      path: `/routes/moderation/actions/v1`,
      method: "GET",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags moderation, dbtn/module:moderation
   * @name update_report_status_v1
   * @summary Update Report Status V1
   * @request POST:/routes/moderation/reports/update/v1
   */
  update_report_status_v1 = (data: UpdateReportRequest, params: RequestParams = {}) =>
    this.request<UpdateReportStatusV1Data, UpdateReportStatusV1Error>({
      path: `/routes/moderation/reports/update/v1`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get visibility settings for a user
   *
   * @tags dbtn/module:profile_visibility
   * @name get_visibility_settings
   * @summary Get Visibility Settings
   * @request GET:/routes/profile/visibility/{user_id}
   */
  get_visibility_settings = ({ userId, ...query }: GetVisibilitySettingsParams, params: RequestParams = {}) =>
    this.request<GetVisibilitySettingsData, GetVisibilitySettingsError>({
      path: `/routes/profile/visibility/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update visibility settings for a user
   *
   * @tags dbtn/module:profile_visibility
   * @name update_visibility_settings
   * @summary Update Visibility Settings
   * @request POST:/routes/profile/visibility/update
   */
  update_visibility_settings = (data: UpdateVisibilityRequest, params: RequestParams = {}) =>
    this.request<UpdateVisibilitySettingsData, UpdateVisibilitySettingsError>({
      path: `/routes/profile/visibility/update`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all available subscription plans
   *
   * @tags dbtn/module:subscription
   * @name get_subscription_plans
   * @summary Get Subscription Plans
   * @request GET:/routes/subscription-plans
   */
  get_subscription_plans = (params: RequestParams = {}) =>
    this.request<GetSubscriptionPlansData, any>({
      path: `/routes/subscription-plans`,
      method: "GET",
      ...params,
    });

  /**
   * @description Start a free trial subscription using a trial code
   *
   * @tags dbtn/module:subscription
   * @name start_trial
   * @summary Start Trial
   * @request POST:/routes/start-trial
   */
  start_trial = (data: StartTrialRequest, params: RequestParams = {}) =>
    this.request<StartTrialData, StartTrialError>({
      path: `/routes/start-trial`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all subscription features and their access levels
   *
   * @tags dbtn/module:subscription
   * @name get_subscription_features
   * @summary Get Subscription Features
   * @request GET:/routes/subscription-features
   */
  get_subscription_features = (params: RequestParams = {}) =>
    this.request<GetSubscriptionFeaturesData, any>({
      path: `/routes/subscription-features`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get subscription details for a user
   *
   * @tags dbtn/module:subscription
   * @name get_user_subscription
   * @summary Get User Subscription
   * @request GET:/routes/user-subscription/{user_id}
   */
  get_user_subscription = ({ userId, ...query }: GetUserSubscriptionParams, params: RequestParams = {}) =>
    this.request<GetUserSubscriptionData, GetUserSubscriptionError>({
      path: `/routes/user-subscription/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Add a new payment method for a user
   *
   * @tags dbtn/module:subscription
   * @name add_payment_method
   * @summary Add Payment Method
   * @request POST:/routes/payment-methods/{user_id}
   */
  add_payment_method = ({ userId, ...query }: AddPaymentMethodParams, params: RequestParams = {}) =>
    this.request<AddPaymentMethodData, AddPaymentMethodError>({
      path: `/routes/payment-methods/${userId}`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Get all payment methods for a user
   *
   * @tags dbtn/module:subscription
   * @name get_payment_methods
   * @summary Get Payment Methods
   * @request GET:/routes/payment-methods/{user_id}
   */
  get_payment_methods = ({ userId, ...query }: GetPaymentMethodsParams, params: RequestParams = {}) =>
    this.request<GetPaymentMethodsData, GetPaymentMethodsError>({
      path: `/routes/payment-methods/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update a user's subscription using Stripe for payment processing
   *
   * @tags dbtn/module:subscription
   * @name update_subscription
   * @summary Update Subscription
   * @request POST:/routes/subscriptions/{user_id}/update
   */
  update_subscription = (
    { userId, ...query }: UpdateSubscriptionParams,
    data: SubscriptionUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateSubscriptionData, UpdateSubscriptionError>({
      path: `/routes/subscriptions/${userId}/update`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get payment transaction history for a user
   *
   * @tags dbtn/module:subscription
   * @name get_transactions
   * @summary Get Transactions
   * @request GET:/routes/transactions/{user_id}
   */
  get_transactions = ({ userId, ...query }: GetTransactionsParams, params: RequestParams = {}) =>
    this.request<GetTransactionsData, GetTransactionsError>({
      path: `/routes/transactions/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get invoice history for a user
   *
   * @tags dbtn/module:subscription
   * @name get_invoices
   * @summary Get Invoices
   * @request GET:/routes/invoices/{user_id}
   */
  get_invoices = ({ userId, ...query }: GetInvoicesParams, params: RequestParams = {}) =>
    this.request<GetInvoicesData, GetInvoicesError>({
      path: `/routes/invoices/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description List all trial codes (admin only)
   *
   * @tags dbtn/module:subscription
   * @name list_trial_codes
   * @summary List Trial Codes
   * @request GET:/routes/admin/trial-codes
   */
  list_trial_codes = (params: RequestParams = {}) =>
    this.request<ListTrialCodesData, any>({
      path: `/routes/admin/trial-codes`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new trial code (admin only)
   *
   * @tags dbtn/module:subscription
   * @name create_trial_code
   * @summary Create Trial Code
   * @request POST:/routes/admin/trial-codes
   */
  create_trial_code = (data: CreateTrialCodeRequest, params: RequestParams = {}) =>
    this.request<CreateTrialCodeData, CreateTrialCodeError>({
      path: `/routes/admin/trial-codes`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Deactivate a trial code (admin only)
   *
   * @tags dbtn/module:subscription
   * @name deactivate_trial_code
   * @summary Deactivate Trial Code
   * @request PUT:/routes/admin/trial-codes/{code}/deactivate
   */
  deactivate_trial_code = ({ code, ...query }: DeactivateTrialCodeParams, params: RequestParams = {}) =>
    this.request<DeactivateTrialCodeData, DeactivateTrialCodeError>({
      path: `/routes/admin/trial-codes/${code}/deactivate`,
      method: "PUT",
      ...params,
    });

  /**
   * @description Check if a user has access to a specific feature
   *
   * @tags dbtn/module:subscription
   * @name get_feature_access
   * @summary Get Feature Access
   * @request GET:/routes/check-feature-access/{user_id}/{feature_name}
   */
  get_feature_access = ({ userId, featureName, ...query }: GetFeatureAccessParams, params: RequestParams = {}) =>
    this.request<GetFeatureAccessData, GetFeatureAccessError>({
      path: `/routes/check-feature-access/${userId}/${featureName}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get analytics for fund managers
   *
   * @tags analytics, dbtn/module:analytics
   * @name get_fund_manager_analytics
   * @summary Get Fund Manager Analytics
   * @request GET:/routes/analytics/fund-manager/{user_id}
   */
  get_fund_manager_analytics = ({ userId, ...query }: GetFundManagerAnalyticsParams, params: RequestParams = {}) =>
    this.request<GetFundManagerAnalyticsData, GetFundManagerAnalyticsError>({
      path: `/routes/analytics/fund-manager/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get analytics for limited partners
   *
   * @tags analytics, dbtn/module:analytics
   * @name get_lp_analytics
   * @summary Get Lp Analytics
   * @request GET:/routes/analytics/limited-partner/{user_id}
   */
  get_lp_analytics = ({ userId, ...query }: GetLpAnalyticsParams, params: RequestParams = {}) =>
    this.request<GetLpAnalyticsData, GetLpAnalyticsError>({
      path: `/routes/analytics/limited-partner/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get analytics for capital raisers
   *
   * @tags analytics, dbtn/module:analytics
   * @name get_capital_raiser_analytics
   * @summary Get Capital Raiser Analytics
   * @request GET:/routes/analytics/capital-raiser/{user_id}
   */
  get_capital_raiser_analytics = ({ userId, ...query }: GetCapitalRaiserAnalyticsParams, params: RequestParams = {}) =>
    this.request<GetCapitalRaiserAnalyticsData, GetCapitalRaiserAnalyticsError>({
      path: `/routes/analytics/capital-raiser/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get platform-wide analytics for admins Function renamed to avoid duplicate operation ID with admin_analytics module.
   *
   * @tags analytics, dbtn/module:analytics
   * @name get_admin_analytics2
   * @summary Get Admin Analytics2
   * @request GET:/routes/analytics/admin
   */
  get_admin_analytics2 = (params: RequestParams = {}) =>
    this.request<GetAdminAnalytics2Data, any>({
      path: `/routes/analytics/admin`,
      method: "GET",
      ...params,
    });

  /**
   * @description Health check endpoint for the models API router Function renamed to avoid duplicate operation ID with other health check endpoints.
   *
   * @tags dbtn/module:router
   * @name check_health_router
   * @summary Check Health Router
   * @request GET:/routes/api-health
   */
  check_health_router = (params: RequestParams = {}) =>
    this.request<CheckHealthRouterData, any>({
      path: `/routes/api-health`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get the admin analytics dashboard This endpoint matches the exact path expected by the frontend. This is a synchronous implementation that directly generates dashboard data. Function renamed to avoid duplicate operation ID with admin_analytics module. Returns: AdminDashboard containing platform-wide analytics data
   *
   * @tags routes, dbtn/module:routes
   * @name route_admin_analytics_dashboard_endpoint
   * @summary Route Admin Analytics Dashboard Endpoint
   * @request GET:/routes/admin/analytics/dashboard
   */
  route_admin_analytics_dashboard_endpoint = (params: RequestParams = {}) =>
    this.request<RouteAdminAnalyticsDashboardEndpointData, any>({
      path: `/routes/admin/analytics/dashboard`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get content reports, matching the frontend path expectations Uses lazy imports to avoid circular dependencies.
   *
   * @tags content, dbtn/module:content
   * @name get_content_reports_wrapper
   * @summary Get Content Reports Wrapper
   * @request GET:/routes/content/reports
   */
  get_content_reports_wrapper = (query: GetContentReportsWrapperParams, params: RequestParams = {}) =>
    this.request<GetContentReportsWrapperData, GetContentReportsWrapperError>({
      path: `/routes/content/reports`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get content rules, matching the frontend path expectations Uses lazy imports to avoid circular dependencies.
   *
   * @tags content, dbtn/module:content
   * @name get_content_rules_wrapper
   * @summary Get Content Rules Wrapper
   * @request GET:/routes/content/rules
   */
  get_content_rules_wrapper = (params: RequestParams = {}) =>
    this.request<GetContentRulesWrapperData, any>({
      path: `/routes/content/rules`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get content reports, matching the frontend path expectations Uses lazy imports to avoid circular dependencies.
   *
   * @tags content, dbtn/module:content_v2
   * @name get_content_reports_v2
   * @summary Get Content Reports V2
   * @request GET:/routes/content_v2/reports
   */
  get_content_reports_v2 = (query: GetContentReportsV2Params, params: RequestParams = {}) =>
    this.request<GetContentReportsV2Data, GetContentReportsV2Error>({
      path: `/routes/content_v2/reports`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get content rules, matching the frontend path expectations Uses lazy imports to avoid circular dependencies.
   *
   * @tags content, dbtn/module:content_v2
   * @name get_content_rules_v2
   * @summary Get Content Rules V2
   * @request GET:/routes/content_v2/rules
   */
  get_content_rules_v2 = (params: RequestParams = {}) =>
    this.request<GetContentRulesV2Data, any>({
      path: `/routes/content_v2/rules`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get platform-wide analytics for admins using the path-based route This endpoint matches the exact path expected by direct API calls. Returns: AdminAnalytics containing platform-wide analytics data
   *
   * @tags admin, dbtn/module:admin_analytics
   * @name get_admin_analytics_by_path
   * @summary Get Admin Analytics By Path
   * @request GET:/routes/routes/analytics/admin
   */
  get_admin_analytics_by_path = (params: RequestParams = {}) =>
    this.request<GetAdminAnalyticsByPathData, any>({
      path: `/routes/routes/analytics/admin`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get platform-wide analytics dashboard for admins This endpoint matches the exact path the frontend is trying to access. This is a synchronous version that wraps the async get_admin_dashboard() function. Returns: AdminDashboard containing platform-wide analytics data
   *
   * @tags admin, dbtn/module:admin_analytics
   * @name get_admin_analytics_dashboard
   * @summary Get Admin Analytics Dashboard
   * @request GET:/routes/routes/admin/analytics/dashboard
   */
  get_admin_analytics_dashboard = (params: RequestParams = {}) =>
    this.request<GetAdminAnalyticsDashboardData, any>({
      path: `/routes/routes/admin/analytics/dashboard`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get platform-wide analytics for admins This endpoint matches the exact function name expected by the Brain client. Function renamed to avoid duplicate operation ID. Returns: AdminAnalytics containing platform-wide analytics data
   *
   * @tags admin, dbtn/module:admin_analytics
   * @name get_admin_analytics_endpoint
   * @summary Get Admin Analytics Endpoint
   * @request GET:/routes/get-admin-analytics
   */
  get_admin_analytics_endpoint = (params: RequestParams = {}) =>
    this.request<GetAdminAnalyticsEndpointData, any>({
      path: `/routes/get-admin-analytics`,
      method: "GET",
      ...params,
    });

  /**
   * @description Root endpoint for getting admin analytics This endpoint is needed for direct brain.get_admin_analytics() calls from the frontend. Returns: AdminAnalytics containing platform-wide analytics data
   *
   * @tags admin, dbtn/module:admin_analytics
   * @name get_admin_analytics_root
   * @summary Get Admin Analytics Root
   * @request GET:/routes/
   */
  get_admin_analytics_root = (params: RequestParams = {}) =>
    this.request<GetAdminAnalyticsRootData, any>({
      path: `/routes/`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get the complete admin dashboard This endpoint aggregates data from all parts of the platform to provide a comprehensive view for administrators. Returns: AdminDashboard containing all metrics and recent activities
   *
   * @tags admin, dbtn/module:admin_analytics
   * @name get_admin_dashboard
   * @summary Get Admin Dashboard
   * @request GET:/routes/dashboard
   */
  get_admin_dashboard = (params: RequestParams = {}) =>
    this.request<GetAdminDashboardData, any>({
      path: `/routes/dashboard`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get detailed analytics for a specific user type Args: role: The user role to get analytics for Returns: UserTypeMetrics for the specified role
   *
   * @tags admin, dbtn/module:admin_analytics
   * @name get_user_type_analytics
   * @summary Get User Type Analytics
   * @request GET:/routes/user-type/{role}
   */
  get_user_type_analytics = ({ role, ...query }: GetUserTypeAnalyticsParams, params: RequestParams = {}) =>
    this.request<GetUserTypeAnalyticsData, GetUserTypeAnalyticsError>({
      path: `/routes/user-type/${role}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get detailed matching analytics Returns: MatchingMetrics containing platform-wide matching data
   *
   * @tags admin, dbtn/module:admin_analytics
   * @name get_matching_analytics
   * @summary Get Matching Analytics
   * @request GET:/routes/matching
   */
  get_matching_analytics = (params: RequestParams = {}) =>
    this.request<GetMatchingAnalyticsData, any>({
      path: `/routes/matching`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get detailed fundraising analytics Returns: FundraisingMetrics containing platform-wide fundraising data
   *
   * @tags admin, dbtn/module:admin_analytics
   * @name get_fundraising_analytics
   * @summary Get Fundraising Analytics
   * @request GET:/routes/fundraising
   */
  get_fundraising_analytics = (params: RequestParams = {}) =>
    this.request<GetFundraisingAnalyticsData, any>({
      path: `/routes/fundraising`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get verification system settings
   *
   * @tags verification_settings, dbtn/module:settings
   * @name get_verification_settings
   * @summary Get Verification Settings
   * @request GET:/routes/verification-settings/
   */
  get_verification_settings = (params: RequestParams = {}) =>
    this.request<GetVerificationSettingsData, any>({
      path: `/routes/verification-settings/`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update verification system settings
   *
   * @tags verification_settings, dbtn/module:settings
   * @name update_verification_settings
   * @summary Update Verification Settings
   * @request POST:/routes/verification-settings/
   */
  update_verification_settings = (data: AppApisSettingsVerificationSettings, params: RequestParams = {}) =>
    this.request<UpdateVerificationSettingsData, UpdateVerificationSettingsError>({
      path: `/routes/verification-settings/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a new user profile with role-specific validation This endpoint handles: 1. Profile data validation based on user role 2. Duplicate profile prevention 3. Default privacy settings 4. Timestamp management 5. Storage of validated profiles
   *
   * @tags profiles, dbtn/module:profile_management
   * @name create_profile_v2
   * @summary Create Profile V2
   * @request POST:/routes/profile/management/create-profile
   */
  create_profile_v2 = (data: CreateProfileRequest, params: RequestParams = {}) =>
    this.request<CreateProfileV2Data, CreateProfileV2Error>({
      path: `/routes/profile/management/create-profile`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a user's profile with privacy controls Args: user_id: The ID of the user whose profile to retrieve viewer_role: Optional role of the user viewing the profile, used for privacy filtering Returns: Dict containing the filtered profile data based on privacy settings Raises: HTTPException: If profile not found or access denied
   *
   * @tags profiles, dbtn/module:profile_management
   * @name get_profile_v2
   * @summary Get Profile V2
   * @request GET:/routes/profile/management/get-profile/{user_id}
   */
  get_profile_v2 = ({ userId, ...query }: GetProfileV2Params, params: RequestParams = {}) =>
    this.request<GetProfileV2Data, GetProfileV2Error>({
      path: `/routes/profile/management/get-profile/${userId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Update a user's profile This endpoint handles: 1. Partial updates to profile data 2. Validation of updated fields 3. Timestamp management 4. Storage of updated profile 5. Automatic verification status update based on profile completeness Args: user_id: The ID of the user whose profile to update updates: Dictionary containing the fields to update Returns: ProfileResponse with status and profile ID Raises: HTTPException: If profile not found or validation fails
   *
   * @tags profiles, dbtn/module:profile_management
   * @name update_profile_management
   * @summary Update Profile Management
   * @request PUT:/routes/profile/management/update-profile/{user_id}
   */
  update_profile_management = (
    { userId, ...query }: UpdateProfileManagementParams,
    data: UpdateProfileManagementPayload,
    params: RequestParams = {},
  ) =>
    this.request<UpdateProfileManagementData, UpdateProfileManagementError>({
      path: `/routes/profile/management/update-profile/${userId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update profile visibility settings This endpoint handles: 1. Validation of visibility settings 2. Profile existence check 3. Update of privacy controls 4. Timestamp management Args: user_id: The ID of the user whose visibility settings to update visibility: New visibility settings to apply Returns: ProfileResponse with status and profile ID Raises: HTTPException: If profile not found or validation fails
   *
   * @tags profiles, dbtn/module:profile_management
   * @name update_visibility_management
   * @summary Update Visibility Management
   * @request PUT:/routes/profile/management/update-visibility/{user_id}
   */
  update_visibility_management = (
    { userId, ...query }: UpdateVisibilityManagementParams,
    data: ProfileVisibility,
    params: RequestParams = {},
  ) =>
    this.request<UpdateVisibilityManagementData, UpdateVisibilityManagementError>({
      path: `/routes/profile/management/update-visibility/${userId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all profiles with optional filtering and pagination This endpoint handles: 1. Optional filtering by user type 2. Optional filtering for verified profiles only 3. Pagination of results 4. Privacy-aware profile listing Args: user_type: Optional filter for specific user types verified_only: If True, only return verified profiles page: Page number for pagination (1-based) page_size: Number of profiles per page Returns: ProfileListResponse containing paginated profiles and metadata Raises: HTTPException: If listing operation fails
   *
   * @tags profiles, dbtn/module:profile_management
   * @name list_profiles_v2
   * @summary List Profiles V2
   * @request GET:/routes/profile/management/list-profiles
   */
  list_profiles_v2 = (query: ListProfilesV2Params, params: RequestParams = {}) =>
    this.request<ListProfilesV2Data, ListProfilesV2Error>({
      path: `/routes/profile/management/list-profiles`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Submit a document for verification
   *
   * @tags dbtn/module:verification
   * @name submit_verification
   * @summary Submit Verification
   * @request POST:/routes/submit-verification
   */
  submit_verification = (data: VerificationRequest, params: RequestParams = {}) =>
    this.request<SubmitVerificationData, SubmitVerificationError>({
      path: `/routes/submit-verification`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get verification status for a user with both document status and profile completion
   *
   * @tags dbtn/module:verification
   * @name get_verification_status
   * @summary Get Verification Status
   * @request GET:/routes/verification-status/{user_id}
   */
  get_verification_status = ({ userId, ...query }: GetVerificationStatusParams, params: RequestParams = {}) =>
    this.request<GetVerificationStatusData, GetVerificationStatusError>({
      path: `/routes/verification-status/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Review a verification document
   *
   * @tags dbtn/module:verification
   * @name review_document
   * @summary Review Document
   * @request POST:/routes/review-document
   */
  review_document = (data: ReviewRequest, params: RequestParams = {}) =>
    this.request<ReviewDocumentData, ReviewDocumentError>({
      path: `/routes/review-document`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all pending verification documents
   *
   * @tags dbtn/module:verification
   * @name get_pending_verifications
   * @summary Get Pending Verifications
   * @request GET:/routes/pending-verifications
   */
  get_pending_verifications = (params: RequestParams = {}) =>
    this.request<GetPendingVerificationsData, any>({
      path: `/routes/pending-verifications`,
      method: "GET",
      ...params,
    });

  /**
   * @description Upload a document for verification with flexible requirements based on settings This endpoint will check verification settings to determine if document verification is required or if profile completeness is sufficient for verification.
   *
   * @tags dbtn/module:verification
   * @name upload_verification_document
   * @summary Upload Verification Document
   * @request POST:/routes/upload-verification-document
   */
  upload_verification_document = (data: BodyUploadVerificationDocument, params: RequestParams = {}) =>
    this.request<UploadVerificationDocumentData, UploadVerificationDocumentError>({
      path: `/routes/upload-verification-document`,
      method: "POST",
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * @description Download a verification document by ID
   *
   * @tags dbtn/module:verification
   * @name download_document
   * @summary Download Document
   * @request GET:/routes/download-document/{document_id}
   */
  download_document = ({ documentId, ...query }: DownloadDocumentParams, params: RequestParams = {}) =>
    this.request<DownloadDocumentData, DownloadDocumentError>({
      path: `/routes/download-document/${documentId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Test a pattern against content
   *
   * @tags moderation, dbtn/module:content_rules
   * @name test_pattern
   * @summary Test Pattern
   * @request POST:/routes/test-pattern
   */
  test_pattern = (data: AppApisContentRulesPatternTestRequest, params: RequestParams = {}) =>
    this.request<TestPatternData, TestPatternError>({
      path: `/routes/test-pattern`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get moderation settings
   *
   * @tags dbtn/module:moderation_settings
   * @name get_moderation_settings_v1
   * @summary Get Moderation Settings V1
   * @request GET:/routes/moderation-settings
   */
  get_moderation_settings_v1 = (params: RequestParams = {}) =>
    this.request<GetModerationSettingsV1Data, any>({
      path: `/routes/moderation-settings`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update moderation settings
   *
   * @tags dbtn/module:moderation_settings
   * @name update_moderation_settings_v1
   * @summary Update Moderation Settings V1
   * @request POST:/routes/moderation-settings
   */
  update_moderation_settings_v1 = (data: AppApisModerationSettingsModerationSettings, params: RequestParams = {}) =>
    this.request<UpdateModerationSettingsV1Data, UpdateModerationSettingsV1Error>({
      path: `/routes/moderation-settings`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get content moderation rules
   *
   * @tags dbtn/module:moderation_settings
   * @name get_content_rules_v12
   * @summary Get Content Rules V1
   * @request GET:/routes/content-rules
   * @originalName get_content_rules_v1
   * @duplicate
   */
  get_content_rules_v12 = (params: RequestParams = {}) =>
    this.request<GetContentRulesV12Data, any>({
      path: `/routes/content-rules`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update content moderation rules
   *
   * @tags dbtn/module:moderation_settings
   * @name update_content_rules_v1
   * @summary Update Content Rules V1
   * @request POST:/routes/content-rules
   */
  update_content_rules_v1 = (data: UpdateContentRulesV1Payload, params: RequestParams = {}) =>
    this.request<UpdateContentRulesV1Data, UpdateContentRulesV1Error>({
      path: `/routes/content-rules`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get verification system settings
   *
   * @tags dbtn/module:verification_settings
   * @name get_verification_config
   * @summary Get Verification Config
   * @request GET:/routes/verification-config/
   */
  get_verification_config = (params: RequestParams = {}) =>
    this.request<GetVerificationConfigData, any>({
      path: `/routes/verification-config/`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update verification system settings
   *
   * @tags dbtn/module:verification_settings
   * @name update_verification_config
   * @summary Update Verification Config
   * @request POST:/routes/verification-config/
   */
  update_verification_config = (data: AppApisVerificationSettingsVerificationSettings, params: RequestParams = {}) =>
    this.request<UpdateVerificationConfigData, UpdateVerificationConfigError>({
      path: `/routes/verification-config/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get moderation system settings
   *
   * @tags dbtn/module:verification_settings
   * @name get_moderation_settings
   * @summary Get Moderation Settings
   * @request GET:/routes/moderation/
   */
  get_moderation_settings = (params: RequestParams = {}) =>
    this.request<GetModerationSettingsData, any>({
      path: `/routes/moderation/`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update moderation system settings
   *
   * @tags dbtn/module:verification_settings
   * @name update_moderation_settings
   * @summary Update Moderation Settings
   * @request POST:/routes/moderation/
   */
  update_moderation_settings = (data: AppApisVerificationSettingsModerationSettings, params: RequestParams = {}) =>
    this.request<UpdateModerationSettingsData, UpdateModerationSettingsError>({
      path: `/routes/moderation/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get content moderation rules
   *
   * @tags dbtn/module:verification_settings
   * @name get_content_rules
   * @summary Get Content Rules
   * @request GET:/routes/content-rules/
   */
  get_content_rules = (params: RequestParams = {}) =>
    this.request<GetContentRulesData, any>({
      path: `/routes/content-rules/`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update content moderation rules
   *
   * @tags dbtn/module:verification_settings
   * @name update_content_rules
   * @summary Update Content Rules
   * @request POST:/routes/content-rules/
   */
  update_content_rules = (data: UpdateContentRulesPayload, params: RequestParams = {}) =>
    this.request<UpdateContentRulesData, UpdateContentRulesError>({
      path: `/routes/content-rules/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Test moderation pattern against content
   *
   * @tags dbtn/module:verification_settings
   * @name test_moderation_pattern
   * @summary Test Moderation Pattern
   * @request POST:/routes/test-pattern/
   */
  test_moderation_pattern = (data: AppApisVerificationSettingsPatternTestRequest, params: RequestParams = {}) =>
    this.request<TestModerationPatternData, TestModerationPatternError>({
      path: `/routes/test-pattern/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description GET version of the metrics endpoint for frontend compatibility
   *
   * @tags moderation, dbtn/module:content_rules
   * @name get_moderation_metrics2_get
   * @summary Get Moderation Metrics2 Get
   * @request GET:/routes/metrics2
   */
  get_moderation_metrics2_get = (params: RequestParams = {}) =>
    this.request<GetModerationMetrics2GetData, any>({
      path: `/routes/metrics2`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get comprehensive moderation metrics - version 2 endpoint to match frontend
   *
   * @tags moderation, dbtn/module:content_rules
   * @name get_moderation_metrics2
   * @summary Get Moderation Metrics2
   * @request POST:/routes/metrics2
   */
  get_moderation_metrics2 = (data: GetModerationMetrics2Payload, params: RequestParams = {}) =>
    this.request<GetModerationMetrics2Data, GetModerationMetrics2Error>({
      path: `/routes/metrics2`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get statistics about moderation actions - version 2 endpoint to match frontend
   *
   * @tags moderation, dbtn/module:content_rules
   * @name get_moderation_actions2
   * @summary Get Moderation Actions2
   * @request POST:/routes/moderation-actions2
   */
  get_moderation_actions2 = (data: GetModerationActions2Payload, params: RequestParams = {}) =>
    this.request<GetModerationActions2Data, GetModerationActions2Error>({
      path: `/routes/moderation-actions2`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Test a pattern against content - version 2 endpoint to match frontend
   *
   * @tags moderation, dbtn/module:content_rules
   * @name test_pattern2
   * @summary Test Pattern2
   * @request POST:/routes/test-pattern2
   */
  test_pattern2 = (data: AppApisContentRulesPatternTestRequest, params: RequestParams = {}) =>
    this.request<TestPattern2Data, TestPattern2Error>({
      path: `/routes/test-pattern2`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all content moderation rules - version 2 endpoint to match frontend
   *
   * @tags moderation, dbtn/module:content_rules
   * @name get_content_rules2
   * @summary Get Content Rules2
   * @request POST:/routes/content-rules2
   */
  get_content_rules2 = (data: GetContentRules2Payload, params: RequestParams = {}) =>
    this.request<GetContentRules2Data, GetContentRules2Error>({
      path: `/routes/content-rules2`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get content reports, optionally filtered by status - version 2 endpoint to match frontend
   *
   * @tags moderation, dbtn/module:content_rules
   * @name get_content_reports2
   * @summary Get Content Reports2
   * @request POST:/routes/content-reports2
   */
  get_content_reports2 = (
    query: GetContentReports2Params,
    data: GetContentReports2Payload,
    params: RequestParams = {},
  ) =>
    this.request<GetContentReports2Data, GetContentReports2Error>({
      path: `/routes/content-reports2`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update the status of a content report - version 2 endpoint to match frontend
   *
   * @tags moderation, dbtn/module:content_rules
   * @name update_report_status2
   * @summary Update Report Status2
   * @request POST:/routes/update-report-status2
   */
  update_report_status2 = (data: UpdateReportStatusRequest, params: RequestParams = {}) =>
    this.request<UpdateReportStatus2Data, UpdateReportStatus2Error>({
      path: `/routes/update-report-status2`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all content moderation rules Function renamed to avoid duplicate operation ID with content module.
   *
   * @tags moderation, dbtn/module:content_rules
   * @name get_content_rules_v12
   * @summary Get Content Rules V12
   * @request POST:/routes/rules/get
   */
  get_content_rules_v12 = (params: RequestParams = {}) =>
    this.request<GetContentRulesV12Result, any>({
      path: `/routes/rules/get`,
      method: "POST",
      ...params,
    });

  /**
   * @description Add a new content moderation rule
   *
   * @tags moderation, dbtn/module:content_rules
   * @name add_content_rule
   * @summary Add Content Rule
   * @request POST:/routes/rules/add
   */
  add_content_rule = (data: AppApisContentRulesAddContentRuleRequest, params: RequestParams = {}) =>
    this.request<AddContentRuleData, AddContentRuleError>({
      path: `/routes/rules/add`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get content reports, optionally filtered by status Function renamed to avoid duplicate operation ID with content module.
   *
   * @tags moderation, dbtn/module:content_rules
   * @name get_content_reports_v12
   * @summary Get Content Reports V12
   * @request POST:/routes/reports
   */
  get_content_reports_v12 = (query: GetContentReportsV12Params, params: RequestParams = {}) =>
    this.request<GetContentReportsV12Data, GetContentReportsV12Error>({
      path: `/routes/reports`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Update the status of a content report
   *
   * @tags moderation, dbtn/module:content_rules
   * @name update_report_status
   * @summary Update Report Status
   * @request POST:/routes/reports/{report_id}/status
   */
  update_report_status = (
    { reportId, ...query }: UpdateReportStatusParams,
    data: UpdateReportStatusRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateReportStatusData, UpdateReportStatusError>({
      path: `/routes/reports/${reportId}/status`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get effectiveness metrics for content rules
   *
   * @tags moderation, dbtn/module:content_rules
   * @name get_rule_effectiveness
   * @summary Get Rule Effectiveness
   * @request GET:/routes/effectiveness
   */
  get_rule_effectiveness = (query: GetRuleEffectivenessParams, params: RequestParams = {}) =>
    this.request<GetRuleEffectivenessData, GetRuleEffectivenessError>({
      path: `/routes/effectiveness`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Batch update content rules
   *
   * @tags moderation, dbtn/module:content_rules
   * @name batch_update_rules
   * @summary Batch Update Rules
   * @request POST:/routes/batch-update
   */
  batch_update_rules = (data: BatchUpdateRulesPayload, params: RequestParams = {}) =>
    this.request<BatchUpdateRulesData, BatchUpdateRulesError>({
      path: `/routes/batch-update`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update a content rule
   *
   * @tags moderation, dbtn/module:content_rules
   * @name update_content_rule
   * @summary Update Content Rule
   * @request PUT:/routes/rules/{rule_id}
   */
  update_content_rule = (
    { ruleId, ...query }: UpdateContentRuleParams,
    data: UpdateContentRulePayload,
    params: RequestParams = {},
  ) =>
    this.request<UpdateContentRuleData, UpdateContentRuleError>({
      path: `/routes/rules/${ruleId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get statistics about moderation actions
   *
   * @tags moderation, dbtn/module:content_rules
   * @name get_moderation_actions
   * @summary Get Moderation Actions
   * @request POST:/routes/moderation-actions
   */
  get_moderation_actions = (params: RequestParams = {}) =>
    this.request<GetModerationActionsData, any>({
      path: `/routes/moderation-actions`,
      method: "POST",
      ...params,
    });

  /**
   * @description Get comprehensive moderation metrics
   *
   * @tags moderation, dbtn/module:content_rules
   * @name get_moderation_metrics
   * @summary Get Moderation Metrics
   * @request POST:/routes/metrics
   */
  get_moderation_metrics = (params: RequestParams = {}) =>
    this.request<GetModerationMetricsData, any>({
      path: `/routes/metrics`,
      method: "POST",
      ...params,
    });

  /**
   * @description Get moderation settings - Using same storage key as verification_settings API for data consistency across APIs Returns: ModerationSettings containing the current moderation configuration
   *
   * @tags moderation, dbtn/module:moderation_settings_v1
   * @name get_moderation_settings_v12
   * @summary Get Moderation Settings V1
   * @request GET:/routes/moderation-settings/settings
   * @originalName get_moderation_settings_v1
   * @duplicate
   */
  get_moderation_settings_v12 = (params: RequestParams = {}) =>
    this.request<GetModerationSettingsV12Data, any>({
      path: `/routes/moderation-settings/settings`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update moderation settings - Using same storage key as verification_settings API for data consistency across APIs Args: body: ModerationSettings data to save Returns: Dictionary with success message
   *
   * @tags moderation, dbtn/module:moderation_settings_v1
   * @name update_moderation_settings_v12
   * @summary Update Moderation Settings V1
   * @request POST:/routes/moderation-settings/settings
   * @originalName update_moderation_settings_v1
   * @duplicate
   */
  update_moderation_settings_v12 = (data: AppApisModerationSettingsV1ModerationSettings, params: RequestParams = {}) =>
    this.request<UpdateModerationSettingsV12Data, UpdateModerationSettingsV12Error>({
      path: `/routes/moderation-settings/settings`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Test a moderation pattern against content Args: body: PatternTestRequest containing pattern and content to test Returns: PatternTestResult with match data
   *
   * @tags moderation, dbtn/module:moderation_settings_v1
   * @name test_pattern_v12
   * @summary Test Pattern V1
   * @request POST:/routes/moderation-settings/test-pattern
   * @originalName test_pattern_v1
   * @duplicate
   */
  test_pattern_v12 = (data: AppApisModerationSettingsV1PatternTestRequest, params: RequestParams = {}) =>
    this.request<TestPatternV12Data, TestPatternV12Error>({
      path: `/routes/moderation-settings/test-pattern`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get comprehensive KPI analytics dashboard This endpoint provides a complete view of platform performance across all KPI categories: - User Growth & Profile Engagement - Contact & Networking Activity - Matching Algorithm KPIs - Meetings & Deal Flow - Sector & Role-Based Insights - Subscription & Monetization Metrics - Satisfaction & Support - Additional Engagement Indicators - Performance & Scalability Args: period: Time period filter for analytics data Returns: ComprehensiveKPIDashboard with all platform KPIs
   *
   * @tags analytics, dbtn/module:analytics_dashboard
   * @name get_comprehensive_analytics2
   * @summary Get Comprehensive Analytics
   * @request GET:/routes/kpi-dashboard
   * @originalName get_comprehensive_analytics
   * @duplicate
   */
  get_comprehensive_analytics2 = (query: GetComprehensiveAnalytics2Params, params: RequestParams = {}) =>
    this.request<GetComprehensiveAnalytics2Data, GetComprehensiveAnalytics2Error>({
      path: `/routes/kpi-dashboard`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get analytics summary for the current user
   *
   * @tags dbtn/module:analytics_enhanced
   * @name get_analytics_summary
   * @summary Get Analytics Summary
   * @request GET:/routes/analytics/summary
   */
  get_analytics_summary = (params: RequestParams = {}) =>
    this.request<GetAnalyticsSummaryData, any>({
      path: `/routes/analytics/summary`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get comprehensive analytics for all KPIs across the platform
   *
   * @tags dbtn/module:analytics_enhanced
   * @name get_comprehensive_analytics3
   * @summary Get Comprehensive Analytics
   * @request GET:/routes/comprehensive
   * @originalName get_comprehensive_analytics
   * @duplicate
   */
  get_comprehensive_analytics3 = (query: GetComprehensiveAnalytics3Params, params: RequestParams = {}) =>
    this.request<GetComprehensiveAnalytics3Data, GetComprehensiveAnalytics3Error>({
      path: `/routes/comprehensive`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Export analytics data in the specified format
   *
   * @tags dbtn/module:analytics_enhanced
   * @name export_analytics
   * @summary Export Analytics
   * @request POST:/routes/analytics/export
   */
  export_analytics = (data: ExportFormat, params: RequestParams = {}) =>
    this.request<ExportAnalyticsData, ExportAnalyticsError>({
      path: `/routes/analytics/export`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a trackable link for a document
   *
   * @tags dbtn/module:document_analytics
   * @name create_trackable_link
   * @summary Create Trackable Link
   * @request POST:/routes/documents/tracking/links/create
   */
  create_trackable_link = (data: CreateTrackableLinkRequest, params: RequestParams = {}) =>
    this.request<CreateTrackableLinkData, CreateTrackableLinkError>({
      path: `/routes/documents/tracking/links/create`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Register sections of a document for tracking
   *
   * @tags dbtn/module:document_analytics
   * @name register_document_sections
   * @summary Register Document Sections
   * @request POST:/routes/documents/tracking/sections
   */
  register_document_sections = (data: DocumentSectionRequest, params: RequestParams = {}) =>
    this.request<RegisterDocumentSectionsData, RegisterDocumentSectionsError>({
      path: `/routes/documents/tracking/sections`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Record a document analytics event
   *
   * @tags dbtn/module:document_analytics
   * @name record_analytics_event
   * @summary Record Analytics Event
   * @request POST:/routes/documents/tracking/events
   */
  record_analytics_event = (data: RecordEventRequest, params: RequestParams = {}) =>
    this.request<RecordAnalyticsEventData, RecordAnalyticsEventError>({
      path: `/routes/documents/tracking/events`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get analytics for a document
   *
   * @tags dbtn/module:document_analytics
   * @name get_document_analytics
   * @summary Get Document Analytics
   * @request GET:/routes/documents/{document_id}/analytics
   */
  get_document_analytics = ({ documentId, ...query }: GetDocumentAnalyticsParams, params: RequestParams = {}) =>
    this.request<GetDocumentAnalyticsData, GetDocumentAnalyticsError>({
      path: `/routes/documents/${documentId}/analytics`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get all trackable links for a document
   *
   * @tags dbtn/module:document_analytics
   * @name get_document_links
   * @summary Get Document Links
   * @request GET:/routes/documents/{document_id}/links
   */
  get_document_links = ({ documentId, ...query }: GetDocumentLinksParams, params: RequestParams = {}) =>
    this.request<GetDocumentLinksData, GetDocumentLinksError>({
      path: `/routes/documents/${documentId}/links`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get all registered sections for a document
   *
   * @tags dbtn/module:document_analytics
   * @name get_document_sections
   * @summary Get Document Sections
   * @request GET:/routes/documents/{document_id}/sections
   */
  get_document_sections = ({ documentId, ...query }: GetDocumentSectionsParams, params: RequestParams = {}) =>
    this.request<GetDocumentSectionsData, GetDocumentSectionsError>({
      path: `/routes/documents/${documentId}/sections`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get summary analytics for all documents of a user
   *
   * @tags dbtn/module:document_analytics
   * @name get_analytics_summary2
   * @summary Get Analytics Summary
   * @request GET:/routes/documents/analytics/summary
   * @originalName get_analytics_summary
   * @duplicate
   */
  get_analytics_summary2 = (query: GetAnalyticsSummary2Params, params: RequestParams = {}) =>
    this.request<GetAnalyticsSummary2Data, GetAnalyticsSummary2Error>({
      path: `/routes/documents/analytics/summary`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get user's contact matching settings
   *
   * @tags dbtn/module:contact_matching
   * @name get_matching_settings
   * @summary Get Matching Settings
   * @request GET:/routes/contact-matching/settings
   */
  get_matching_settings = (params: RequestParams = {}) =>
    this.request<GetMatchingSettingsData, any>({
      path: `/routes/contact-matching/settings`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update user's contact matching settings
   *
   * @tags dbtn/module:contact_matching
   * @name update_matching_settings
   * @summary Update Matching Settings
   * @request POST:/routes/contact-matching/settings
   */
  update_matching_settings = (data: ContactMatchSettings, params: RequestParams = {}) =>
    this.request<UpdateMatchingSettingsData, UpdateMatchingSettingsError>({
      path: `/routes/contact-matching/settings`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get globally matched contacts for a user's contacts
   *
   * @tags dbtn/module:contact_matching
   * @name get_global_matches
   * @summary Get Global Matches
   * @request GET:/routes/contact-matching/global-matches
   */
  get_global_matches = (params: RequestParams = {}) =>
    this.request<GetGlobalMatchesData, any>({
      path: `/routes/contact-matching/global-matches`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new search preset
   *
   * @tags search, dbtn/module:search
   * @name create_search_preset
   * @summary Create Search Preset
   * @request POST:/routes/presets
   */
  create_search_preset = (data: SearchPresetInput, params: RequestParams = {}) =>
    this.request<CreateSearchPresetData, CreateSearchPresetError>({
      path: `/routes/presets`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all search presets for a user
   *
   * @tags search, dbtn/module:search
   * @name get_user_presets
   * @summary Get User Presets
   * @request GET:/routes/presets/{user_id}
   */
  get_user_presets = ({ userId, ...query }: GetUserPresetsParams, params: RequestParams = {}) =>
    this.request<GetUserPresetsData, GetUserPresetsError>({
      path: `/routes/presets/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Delete a search preset
   *
   * @tags search, dbtn/module:search
   * @name delete_search_preset
   * @summary Delete Search Preset
   * @request DELETE:/routes/presets/{preset_id}
   */
  delete_search_preset = ({ presetId, ...query }: DeleteSearchPresetParams, params: RequestParams = {}) =>
    this.request<DeleteSearchPresetData, DeleteSearchPresetError>({
      path: `/routes/presets/${presetId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Get search history for a user
   *
   * @tags search, dbtn/module:search
   * @name get_search_history
   * @summary Get Search History
   * @request GET:/routes/history/{user_id}
   */
  get_search_history = ({ userId, ...query }: GetSearchHistoryParams, params: RequestParams = {}) =>
    this.request<GetSearchHistoryData, GetSearchHistoryError>({
      path: `/routes/history/${userId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Search for users based on filters and optionally save to history Returns a paginated response with matched profiles. If no profiles are found, returns an empty response with total=0.
   *
   * @tags search, dbtn/module:search
   * @name search_users
   * @summary Search Users
   * @request POST:/routes/users/search
   */
  search_users = (query: SearchUsersParams, data: AppApisModelsSearchFilters, params: RequestParams = {}) =>
    this.request<SearchUsersData, SearchUsersError>({
      path: `/routes/users/search`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update the last used timestamp of a preset
   *
   * @tags search, dbtn/module:search
   * @name update_preset_last_used
   * @summary Update Preset Last Used
   * @request PUT:/routes/presets/{preset_id}/last-used
   */
  update_preset_last_used = ({ presetId, ...query }: UpdatePresetLastUsedParams, params: RequestParams = {}) =>
    this.request<UpdatePresetLastUsedData, UpdatePresetLastUsedError>({
      path: `/routes/presets/${presetId}/last-used`,
      method: "PUT",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:matching
   * @name get_user_matches
   * @summary Get User Matches
   * @request POST:/routes/get-matches
   */
  get_user_matches = (data: GetUserMatchesRequest, params: RequestParams = {}) =>
    this.request<GetUserMatchesData, GetUserMatchesError>({
      path: `/routes/get-matches`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update a user's matching preferences
   *
   * @tags dbtn/module:matching
   * @name update_match_preferences
   * @summary Update Match Preferences
   * @request POST:/routes/update-match-preferences
   */
  update_match_preferences = (data: UpdatePreferencesRequest, params: RequestParams = {}) =>
    this.request<UpdateMatchPreferencesData, UpdateMatchPreferencesError>({
      path: `/routes/update-match-preferences`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Record that two users have been matched
   *
   * @tags dbtn/module:matching
   * @name record_match
   * @summary Record Match
   * @request POST:/routes/record-match
   */
  record_match = (data: RecordMatchRequest, params: RequestParams = {}) =>
    this.request<RecordMatchData, RecordMatchError>({
      path: `/routes/record-match`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get comprehensive analytics dashboard for Fund of Funds users
   *
   * @tags fund-of-funds-analytics, dbtn/module:fund_of_funds_analytics
   * @name get_comprehensive_dashboard
   * @summary Get Comprehensive Dashboard
   * @request GET:/routes/fund-of-funds-analytics/dashboard
   */
  get_comprehensive_dashboard = (params: RequestParams = {}) =>
    this.request<GetComprehensiveDashboardData, any>({
      path: `/routes/fund-of-funds-analytics/dashboard`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get detailed performance metrics for a specific fund manager
   *
   * @tags fund-of-funds-analytics, dbtn/module:fund_of_funds_analytics
   * @name get_fund_manager_performance
   * @summary Get Fund Manager Performance
   * @request GET:/routes/fund-of-funds-analytics/fund-manager/{fund_id}
   */
  get_fund_manager_performance = ({ fundId, ...query }: GetFundManagerPerformanceParams, params: RequestParams = {}) =>
    this.request<GetFundManagerPerformanceData, GetFundManagerPerformanceError>({
      path: `/routes/fund-of-funds-analytics/fund-manager/${fundId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get investment scorecard with detailed evaluation for a fund
   *
   * @tags fund-of-funds-analytics, dbtn/module:fund_of_funds_analytics
   * @name get_investment_scorecard
   * @summary Get Investment Scorecard
   * @request GET:/routes/fund-of-funds-analytics/investment-scorecard/{fund_id}
   */
  get_investment_scorecard = ({ fundId, ...query }: GetInvestmentScorecardParams, params: RequestParams = {}) =>
    this.request<GetInvestmentScorecardData, GetInvestmentScorecardError>({
      path: `/routes/fund-of-funds-analytics/investment-scorecard/${fundId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get performance analytics across different investment sectors
   *
   * @tags fund-of-funds-analytics, dbtn/module:fund_of_funds_analytics
   * @name get_sector_performance
   * @summary Get Sector Performance
   * @request GET:/routes/fund-of-funds-analytics/sector-performance
   */
  get_sector_performance = (params: RequestParams = {}) =>
    this.request<GetSectorPerformanceData, any>({
      path: `/routes/fund-of-funds-analytics/sector-performance`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get investment patterns of Limited Partners
   *
   * @tags fund-of-funds-analytics, dbtn/module:fund_of_funds_analytics
   * @name get_lp_investment_patterns
   * @summary Get Lp Investment Patterns
   * @request GET:/routes/fund-of-funds-analytics/lp-patterns
   */
  get_lp_investment_patterns = (params: RequestParams = {}) =>
    this.request<GetLpInvestmentPatternsData, any>({
      path: `/routes/fund-of-funds-analytics/lp-patterns`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get performance metrics of Capital Raisers
   *
   * @tags fund-of-funds-analytics, dbtn/module:fund_of_funds_analytics
   * @name get_capital_raiser_performance
   * @summary Get Capital Raiser Performance
   * @request GET:/routes/fund-of-funds-analytics/capital-raiser-performance
   */
  get_capital_raiser_performance = (params: RequestParams = {}) =>
    this.request<GetCapitalRaiserPerformanceData, any>({
      path: `/routes/fund-of-funds-analytics/capital-raiser-performance`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get analytics on network strength and connections
   *
   * @tags fund-of-funds-analytics, dbtn/module:fund_of_funds_analytics
   * @name get_network_strength2
   * @summary Get Network Strength
   * @request GET:/routes/fund-of-funds-analytics/network-strength
   * @originalName get_network_strength
   * @duplicate
   */
  get_network_strength2 = (params: RequestParams = {}) =>
    this.request<GetNetworkStrength2Data, any>({
      path: `/routes/fund-of-funds-analytics/network-strength`,
      method: "GET",
      ...params,
    });
}
