from fastapi import APIRouter

# Create an empty router to satisfy the import system
# IMPORTANT: This must be at the top to avoid circular imports
router = APIRouter(tags=["models"])

from enum import Enum, auto
from typing import Dict, List, Optional, Any, Union, Set
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

# ============ ENUM DEFINITIONS ============

class UserRole(str, Enum):
    ADMIN = "admin"
    MODERATOR = "moderator"
    ANALYST = "analyst"
    VIEWER = "viewer"
    USER = "user"

class UserType(str, Enum):
    FUND_MANAGER = "fund_manager"
    LIMITED_PARTNER = "limited_partner"
    CAPITAL_RAISER = "capital_raiser"
    FUND_OF_FUNDS = "fund_of_funds"
    ADMIN = "admin"

class ReportStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ESCALATED = "escalated"
    UNDER_REVIEW = "under_review"
    AUTO_MODERATED = "auto_moderated"

class ReportType(str, Enum):
    SPAM = "spam"
    HARASSMENT = "harassment"
    FRAUD = "fraud"
    INAPPROPRIATE = "inappropriate"
    PROFANITY = "profanity"
    MISLEADING = "misleading"
    PERSONAL_INFO = "personal_info"
    OTHER = "other"

class SubscriptionTier(str, Enum):
    FREE = "free"
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

class FeatureAccess(str, Enum):
    NONE = "none"
    DISABLED = "disabled"
    LIMITED = "limited"
    BASIC = "basic"
    FULL = "full"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"

class VerificationLevel(str, Enum):
    NONE = "none"
    EMAIL = "email"
    PHONE = "phone"
    DOCUMENT = "document"
    ACCREDITED = "accredited"

class RelationshipType(str, Enum):
    COLLEAGUE = "colleague"
    PORTFOLIO = "portfolio"
    INVESTOR = "investor"
    PARTNER = "partner"
    CLIENT = "client"
    OTHER = "other"

class RelationshipStatus(str, Enum):
    PENDING = "pending"
    CONNECTED = "connected"
    DECLINED = "declined"
    BLOCKED = "blocked"

class ContentRuleAction(str, Enum):
    FLAG = "flag"
    FILTER = "filter"
    HIDE = "hide"
    DELETE = "delete"
    BLOCK_USER = "block_user"

class ContentRuleSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class UserAction(str, Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    PROFILE_UPDATE = "profile_update"
    CONTACT_ADDED = "contact_added"
    DOCUMENT_UPLOADED = "document_uploaded"
    MESSAGE_SENT = "message_sent"
    SEARCH_PERFORMED = "search_performed"
    MATCH_ACCEPTED = "match_accepted"

# ============ BASE REQUEST/RESPONSE MODELS ============

class TokenRequest(BaseModel):
    token: Dict = Field(..., description="Authentication token")
    
    model_config = {"arbitrary_types_allowed": True}

# ============ USER & PROFILE MODELS ============

class BaseProfile(BaseModel):
    user_id: str
    name: str
    email: Optional[EmailStr] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    user_type: UserType
    
    model_config = {"arbitrary_types_allowed": True}

class ExtendedUserProfile(BaseProfile):
    company_name: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    profile_image_url: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    verified: bool = False
    verification_level: VerificationLevel = VerificationLevel.NONE
    subscription_tier: SubscriptionTier = SubscriptionTier.FREE
    last_active: Optional[str] = None
    specializations: List[str] = Field(default_factory=list)
    total_connections: int = 0
    match_percentage: Optional[float] = None
    is_public: bool = True
    
    model_config = {"arbitrary_types_allowed": True}

class ListProfilesRequest(BaseModel):
    user_type: Optional[UserType] = None
    verified_only: bool = False
    limit: int = 50
    offset: int = 0
    token: Dict
    
    model_config = {"arbitrary_types_allowed": True}

# ============ CONTACT MODELS ============

class Contact(BaseModel):
    id: str
    owner_id: str
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    title: Optional[str] = None
    contact_type: UserType
    notes: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    created_at: str
    updated_at: Optional[str] = None
    linkedin_url: Optional[str] = None
    last_connected: Optional[str] = None
    is_shared: bool = False
    shared_with: List[str] = Field(default_factory=list)
    match_criteria: Optional[Dict[str, Any]] = None
    
    model_config = {"arbitrary_types_allowed": True}

class ContactMatch(BaseModel):
    contact_id: str
    match_id: str
    match_score: float
    match_reasons: List[str] = Field(default_factory=list)
    matched_at: str
    status: str = "pending"
    
    model_config = {"arbitrary_types_allowed": True}

class ContactOwnershipHistory(BaseModel):
    contact_id: str
    previous_owner_id: str
    new_owner_id: str
    transferred_at: str
    reason: Optional[str] = None
    
    model_config = {"arbitrary_types_allowed": True}

# ============ RELATIONSHIP MODELS ============

class InteractionType(str, Enum):
    MESSAGE = "message"
    MEETING = "meeting"
    INTRODUCTION = "introduction"
    INVESTMENT = "investment"
    DOCUMENT_SHARE = "document_share"
    DEAL = "deal"
    OTHER = "other"

class RelationshipHistory(BaseModel):
    relationship_id: str
    events: List[Dict[str, Any]] = Field(default_factory=list)
    first_connected: Optional[str] = None
    last_interaction: Optional[str] = None
    total_interactions: int = 0
    
    model_config = {"arbitrary_types_allowed": True}

class StrengthFactors(BaseModel):
    communication_frequency: float = 0.0
    response_time: float = 0.0
    meeting_frequency: float = 0.0
    deal_collaboration: float = 0.0
    mutual_connections: float = 0.0
    longevity: float = 0.0
    trust_indicators: float = 0.0
    recommendation_strength: float = 0.0
    
    model_config = {"arbitrary_types_allowed": True}

class Interaction(BaseModel):
    id: str
    type: str  # Using string instead of enum reference for flexibility
    timestamp: str
    initiator_id: str
    recipient_id: str
    context: Optional[str] = None
    duration: Optional[int] = None  # duration in minutes if applicable
    outcome: Optional[str] = None
    notes: Optional[str] = None
    attachments: List[str] = Field(default_factory=list)
    
    model_config = {"arbitrary_types_allowed": True}

class StrengthScore(BaseModel):
    overall: float = 0.0  # 0-100 scale
    communication: float = 0.0
    trust: float = 0.0
    engagement: float = 0.0
    reliability: float = 0.0
    history: float = 0.0
    
    model_config = {"arbitrary_types_allowed": True}

class RelationshipMetrics(BaseModel):
    total_interactions: int = 0
    interaction_types: Dict[str, int] = Field(default_factory=dict)
    last_interaction: Optional[str] = None
    avg_response_time: Optional[float] = None
    meeting_frequency: Optional[float] = None
    strength_score: StrengthScore = Field(default_factory=StrengthScore)
    
    model_config = {"arbitrary_types_allowed": True}

class Relationship(BaseModel):
    id: str
    user_id: str
    contact_id: str
    relationship_type: str
    status: str
    strength: float = 0.0  # 0-100 scale
    last_interaction: Optional[str] = None
    created_at: str
    notes: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    
    model_config = {"arbitrary_types_allowed": True}

class RelationshipResponse(BaseModel):
    id: str
    user_id: str
    contact_id: str
    relationship_type: str
    status: str
    strength: float
    metrics: Dict[str, Any] = Field(default_factory=dict)
    last_interaction: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None
    
    model_config = {"arbitrary_types_allowed": True}

class RelationshipStrength(BaseModel):
    relationship_id: str
    interaction_count: int = 0
    last_interaction: Optional[str] = None
    communication_frequency: float = 0.0  # interactions per week
    response_rate: float = 0.0  # 0.0 to 1.0
    response_time: Optional[float] = None  # average in hours
    mutual_connections: int = 0
    strength_score: float = 0.0  # 0.0 to 1.0
    
    model_config = {"arbitrary_types_allowed": True}

# ============ SUBSCRIPTION MODELS ============

class UserSubscription(BaseModel):
    user_id: str
    tier: SubscriptionTier
    starts_at: str
    ends_at: Optional[str] = None
    is_active: bool = True
    payment_id: Optional[str] = None
    auto_renew: bool = False
    features: Dict[str, FeatureAccess] = Field(default_factory=dict)
    
    model_config = {"arbitrary_types_allowed": True}

class RefundRequest(BaseModel):
    subscription_id: str
    user_id: str
    reason: str
    amount: float
    token: Dict
    
    model_config = {"arbitrary_types_allowed": True}

class RefundResponse(BaseModel):
    refund_id: str
    status: str
    amount: float
    processed_at: str
    
    model_config = {"arbitrary_types_allowed": True}

class CancellationRequest(BaseModel):
    subscription_id: str
    user_id: str
    reason: str
    immediate: bool = False
    token: Dict
    
    model_config = {"arbitrary_types_allowed": True}

class CancellationResponse(BaseModel):
    status: str
    effective_date: str
    
    model_config = {"arbitrary_types_allowed": True}

# ============ VERIFICATION MODELS ============

class DocumentType(str, Enum):
    ID_CARD = "id_card"
    PASSPORT = "passport"
    DRIVERS_LICENSE = "drivers_license"
    BUSINESS_LICENSE = "business_license"
    CERTIFICATION = "certification"
    ACCREDITATION = "accreditation"
    OTHER = "other"

class ReviewRequest(BaseModel):
    verification_id: str
    reviewer_id: str
    status: VerificationStatus
    notes: Optional[str] = None
    token: Dict[str, Any]
    
    model_config = {"arbitrary_types_allowed": True}

class VerificationResponse(BaseModel):
    status: str
    verification_id: Optional[str] = None
    message: str
    level: Optional[VerificationLevel] = None
    document_types: Optional[List[str]] = None
    expires_at: Optional[str] = None
    
    model_config = {"arbitrary_types_allowed": True}

class VerificationDocument(BaseModel):
    id: str
    user_id: str
    document_type: str
    file_name: str
    file_size: int
    mime_type: str
    upload_date: str
    status: VerificationStatus = VerificationStatus.PENDING
    review_date: Optional[str] = None
    reviewer_id: Optional[str] = None
    review_notes: Optional[str] = None
    expiry_date: Optional[str] = None
    verification_level: VerificationLevel
    
    model_config = {"arbitrary_types_allowed": True}

# ============ SEARCH MODELS ============

class SearchFilters(BaseModel):
    user_types: Optional[List[UserType]] = None
    specializations: Optional[List[str]] = None
    locations: Optional[List[str]] = None
    min_connections: Optional[int] = None
    verified_only: bool = False
    subscription_tiers: Optional[List[SubscriptionTier]] = None
    
    model_config = {"arbitrary_types_allowed": True}

class SearchResult(BaseModel):
    profile: ExtendedUserProfile
    relevance_score: float
    match_reason: Optional[str] = None
    
    model_config = {"arbitrary_types_allowed": True}

class SearchPreset(BaseModel):
    id: str
    user_id: str
    name: str
    filters: SearchFilters
    created_at: str
    
    model_config = {"arbitrary_types_allowed": True}

class SearchHistoryEntry(BaseModel):
    id: str
    user_id: str
    query: str
    filters: SearchFilters
    result_count: int
    timestamp: str
    
    model_config = {"arbitrary_types_allowed": True}

class PaginatedSearchResponse(BaseModel):
    results: List[SearchResult]
    total_count: int
    page: int
    page_size: int
    
    model_config = {"arbitrary_types_allowed": True}

class MatchPreferences(BaseModel):
    user_id: str
    preferred_user_types: List[UserType] = Field(default_factory=list)
    preferred_specializations: List[str] = Field(default_factory=list)
    preferred_locations: List[str] = Field(default_factory=list)
    minimum_verification_level: VerificationLevel = VerificationLevel.NONE
    importance_weights: Dict[str, float] = Field(default_factory=dict)
    
    model_config = {"arbitrary_types_allowed": True}

# ============ MESSAGING & COMMUNICATION MODELS ============

class Message(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    recipient_id: str
    content: str
    attachments: List[str] = Field(default_factory=list)
    sent_at: str
    read_at: Optional[str] = None
    is_deleted: bool = False
    
    model_config = {"arbitrary_types_allowed": True}

# ============ PERMISSIONS MODELS ============

class RolePermissionsResponse(BaseModel):
    role: UserRole
    permissions: Dict[str, bool]
    
    model_config = {"arbitrary_types_allowed": True}

class UpdateRolePermissionsRequest(BaseModel):
    role: UserRole
    permissions: Dict[str, bool]
    token: Dict
    
    model_config = {"arbitrary_types_allowed": True}

# ============ ANALYTICS MODELS ============

class UserTypeMetrics(BaseModel):
    total_users: int
    active_users: int
    new_users_30d: int
    engagement_rate: float
    average_connections: float
    total_interactions: int
    
    model_config = {"arbitrary_types_allowed": True}

class MatchingMetrics(BaseModel):
    total_matches: int
    successful_matches: int
    average_match_quality: float
    match_response_rate: float
    average_time_to_response: float
    
    model_config = {"arbitrary_types_allowed": True}

class FundraisingMetrics(BaseModel):
    total_capital_raised: float
    number_of_deals: int
    average_deal_size: float
    success_rate: float
    deals_by_fund_type: Dict[str, int]
    capital_by_fund_type: Dict[str, float]
    
    model_config = {"arbitrary_types_allowed": True}

class PlatformMetrics(BaseModel):
    total_users: int
    active_users_30d: int
    total_interactions: int
    average_response_time: float
    user_growth_rate: float
    platform_engagement_rate: float
    
    model_config = {"arbitrary_types_allowed": True}

class AdminDashboard(BaseModel):
    last_updated: str
    platform_metrics: PlatformMetrics
    user_type_metrics: Dict[str, UserTypeMetrics]
    matching_metrics: MatchingMetrics
    fundraising_metrics: FundraisingMetrics
    recent_activities: List[Dict[str, Any]]
    
    model_config = {"arbitrary_types_allowed": True}

# ============ ANALYTICS SUMMARY MODEL ============

class AnalyticsSummary(BaseModel):
    engagement_metrics: Dict[str, Dict[str, float]]
    match_analytics: Dict[str, Any]
    weekly_views: List[int]
    recent_activities: List[Dict[str, str]]
    
    model_config = {"arbitrary_types_allowed": True}

class ExportFormat(str, Enum):
    CSV = "csv"
    JSON = "json"
    XLSX = "xlsx"
    PDF = "pdf"

# ============ MODERATION MODELS ============

class ContentRule(BaseModel):
    id: str = Field(..., description="Unique identifier for the rule")
    pattern: str = Field(..., description="Regex pattern to match")
    action: ContentRuleAction = Field(..., description="Action to take when rule matches")
    severity: ContentRuleSeverity = Field(..., description="Severity level of the rule")
    description: str = Field(..., description="Description of what this rule detects")
    is_active: bool = Field(default=True, description="Whether this rule is active")
    created_at: str = Field(..., description="When the rule was created")
    created_by: str = Field(..., description="User ID who created the rule")
    last_updated: Optional[str] = Field(None, description="When the rule was last updated")
    
    model_config = {"arbitrary_types_allowed": True}

class ContentReport(BaseModel):
    id: str = Field(..., description="Unique identifier for the report")
    content_id: str = Field(..., description="ID of the reported content")
    content_type: str = Field(..., description="Type of content being reported")
    report_type: ReportType = Field(..., description="Type of report")
    reporter_id: str = Field(..., description="User ID who reported the content")
    description: str = Field(..., description="Description of the issue")
    status: ReportStatus = Field(default=ReportStatus.PENDING, description="Current status of the report")
    created_at: str = Field(..., description="When the report was created")
    reviewed_at: Optional[str] = Field(None, description="When the report was reviewed")
    reviewed_by: Optional[str] = Field(None, description="User ID who reviewed the report")
    resolution_notes: Optional[str] = Field(None, description="Notes about the resolution")
    matched_rules: List[str] = Field(default_factory=list, description="IDs of rules that matched")
    
    model_config = {"arbitrary_types_allowed": True}

# ============ PROFILE MODELS ============

class FoFProfile(BaseModel):
    """Friend of Friend Profile - used for extended network visibility"""
    user_id: str
    name: str
    role: str
    company: str
    connection_path: List[str] = Field(default_factory=list)
    connection_strength: float = 0.0
    shared_connections: int = 0
    introduction_available: bool = False
    
    model_config = {"arbitrary_types_allowed": True}

class ProfileListResponse(BaseModel):
    profiles: List[Dict[str, Any]]
    total: int
    page: int
    page_size: int
    
    model_config = {"arbitrary_types_allowed": True}

class CreateProfileRequest(BaseModel):
    profile: Dict[str, Any]
    token: Dict[str, Any]
    
    model_config = {"arbitrary_types_allowed": True}

class UpdateProfileRequest(BaseModel):
    user_id: str
    updates: Dict[str, Any]
    token: Dict[str, Any]
    
    model_config = {"arbitrary_types_allowed": True}

class ProfileResponse(BaseModel):
    status: str
    profile: Dict[str, Any]
    request_id: Optional[str] = None
    
    model_config = {"arbitrary_types_allowed": True}

class ProfileVisibility(BaseModel):
    show_in_search: bool = True
    show_contact_info: bool = False
    show_to_roles: List[str] = Field(default_factory=lambda: ["fund_manager", "limited_partner", "capital_raiser"])
    show_fund_details: bool = False
    show_investment_history: bool = False
    
    model_config = {"arbitrary_types_allowed": True}

class ProfileImage(BaseModel):
    url: str
    content_type: str
    
    model_config = {"arbitrary_types_allowed": True}

class SocialLinks(BaseModel):
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    facebook: Optional[str] = None
    website: Optional[str] = None
    
    model_config = {"arbitrary_types_allowed": True}

class FundType(str, Enum):
    VENTURE_CAPITAL = "venture_capital"
    PRIVATE_EQUITY = "private_equity"
    HEDGE_FUND = "hedge_fund"
    REAL_ESTATE = "real_estate"
    DEBT = "debt"
    FAMILY_OFFICE = "family_office"
    OTHER = "other"

class InvestmentFocus(str, Enum):
    EARLY_STAGE = "early_stage"
    GROWTH = "growth"
    LATE_STAGE = "late_stage"
    PUBLIC_MARKETS = "public_markets"
    DISTRESSED = "distressed"
    BUYOUT = "buyout"
    OTHER = "other"

# Fund Manager Profile
class FundManagerProfile(BaseProfile):
    company: str
    role: str = UserType.FUND_MANAGER
    fund_name: str
    fund_type: FundType
    fund_size: float
    minimum_investment: float
    founded_year: Optional[int] = None
    investment_focus: List[InvestmentFocus] = Field(default_factory=list)
    sectors: List[str] = Field(default_factory=list)
    historical_returns: Optional[float] = None
    risk_profile: Optional[str] = None
    investment_horizon: Optional[int] = None
    team_size: Optional[int] = None
    assets_under_management: Optional[float] = None
    previous_funds: Optional[int] = None
    current_investments: Optional[int] = None
    successful_exits: Optional[int] = None
    investment_philosophy: Optional[str] = None
    social_links: Optional[SocialLinks] = None
    
    model_config = {"arbitrary_types_allowed": True}

# Limited Partner Profile
class LimitedPartnerProfile(BaseProfile):
    company: str
    role: str = UserType.LIMITED_PARTNER
    investor_type: str
    typical_commitment_size: float
    investment_preferences: List[FundType] = Field(default_factory=list)
    sectors_of_interest: List[str] = Field(default_factory=list)
    risk_tolerance: Optional[str] = None
    investment_horizon: Optional[int] = None
    geographic_focus: List[str] = Field(default_factory=list)
    portfolio_size: Optional[int] = None
    existing_investments: Optional[int] = None
    social_links: Optional[SocialLinks] = None
    
    model_config = {"arbitrary_types_allowed": True}

# Fund of Funds Profile
class FundOfFundsProfile(BaseProfile):
    company: str
    role: str = UserType.FUND_OF_FUNDS
    fund_name: str
    fund_size: float
    minimum_investment: float
    founded_year: Optional[int] = None
    investment_focus: List[InvestmentFocus] = Field(default_factory=list)
    sectors: List[str] = Field(default_factory=list)
    historical_returns: Optional[float] = None
    risk_profile: Optional[str] = None
    investment_horizon: Optional[int] = None
    team_size: Optional[int] = None
    assets_under_management: Optional[float] = None
    total_funds_invested: Optional[int] = None
    fund_managers_invested: Optional[int] = None
    average_investment_size: Optional[float] = None
    investment_strategy: Optional[str] = None
    due_diligence_process: Optional[str] = None
    performance_metrics: Optional[Dict[str, float]] = None
    social_links: Optional[SocialLinks] = None
    
    model_config = {"arbitrary_types_allowed": True}

# Capital Raiser Profile
class CapitalRaiserProfile(BaseProfile):
    company: str
    role: str = UserType.CAPITAL_RAISER
    expertise: List[str] = Field(default_factory=list)
    typical_deal_size: float
    deals_raised: int
    total_capital_raised: float
    sectors: List[str] = Field(default_factory=list)
    client_types: List[str] = Field(default_factory=list)
    years_experience: Optional[int] = None
    notable_clients: List[str] = Field(default_factory=list)
    recent_deals: List[str] = Field(default_factory=list)
    success_rate: Optional[float] = None
    services_offered: List[str] = Field(default_factory=list)
    social_links: Optional[SocialLinks] = None
    
    model_config = {"arbitrary_types_allowed": True}

# ============ ANALYTICS MODELS ============

class UserAnalytics(BaseModel):
    profile_views: int = 0
    profile_completeness: float = 0.0
    total_connections: int = 0
    active_connections: int = 0
    avg_relationship_strength: float = 0.0
    response_rate: float = 0.0
    last_active: Optional[str] = None
    
    model_config = {"arbitrary_types_allowed": True}

class FundManagerAnalytics(UserAnalytics):
    total_funds_managed: int = 0
    total_aum: float = 0.0
    avg_fund_performance: float = 0.0
    lp_match_rate: float = 0.0
    successful_raises: int = 0
    
    model_config = {"arbitrary_types_allowed": True}

class LimitedPartnerAnalytics(UserAnalytics):
    total_investments: int = 0
    total_committed: float = 0.0
    fund_manager_match_rate: float = 0.0
    investment_success_rate: float = 0.0
    avg_investment_size: float = 0.0
    
    model_config = {"arbitrary_types_allowed": True}

class CapitalRaiserAnalytics(UserAnalytics):
    total_deals: int = 0
    total_capital_raised: float = 0.0
    success_rate: float = 0.0
    avg_deal_size: float = 0.0
    client_satisfaction: float = 0.0
    
    model_config = {"arbitrary_types_allowed": True}

class AdminAnalytics(BaseModel):
    total_users: Dict[str, int]
    active_users: Dict[str, int]
    total_connections: int
    total_successful_matches: int
    avg_match_quality: float
    user_growth: Dict[str, Any]
    engagement_metrics: Dict[str, float]
    conversion_rates: Dict[str, float]
    
    model_config = {"arbitrary_types_allowed": True}

# ============ VERIFICATION MODELS ============

# Create an alias for backward compatibility
VerificationState = VerificationStatus

class VerificationRequest(BaseModel):
    user_id: str
    document_type: str
    document_id: str
    verification_level: VerificationLevel
    notes: Optional[str] = None
    token: Dict[str, Any]
    
    model_config = {"arbitrary_types_allowed": True}

# ============ RELATIONSHIP MODELS ============

class NetworkStrength(BaseModel):
    user_id: str
    total_connections: int = 0
    active_connections: int = 0
    introduction_rate: float = 0.0
    response_rate: float = 0.0
    influence_score: float = 0.0
    relationship_health: Dict[str, float] = Field(default_factory=dict)
    
    model_config = {"arbitrary_types_allowed": True}

class PatternTestRequest(BaseModel):
    pattern: str
    test_content: str
    token: Dict[str, Any]
    
    model_config = {"arbitrary_types_allowed": True}

class PatternTestResponse(BaseModel):
    matched: bool
    matches: List[Dict[str, Any]] = Field(default_factory=list)
    error: Optional[str] = None
    
    model_config = {"arbitrary_types_allowed": True}
