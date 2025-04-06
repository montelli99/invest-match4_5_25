from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any

router = APIRouter(prefix="/guides", tags=["how-to-guides"])

security = HTTPBearer()

def get_token():
    """Get token from request"""
    credentials = security()
    if not credentials:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    return credentials.credentials



class HowToGuide(BaseModel):
    id: str
    title: str
    content: str
    difficulty: str
    estimated_time: str
    last_updated: str

# Initialize with how-to guides
HOWTO_GUIDES = [
    HowToGuide(
        id="profile-setup",
        title="How to Set Up Your Profile",
        difficulty="Beginner",
        estimated_time="15 minutes",
        last_updated="2024-12-08",
        content="""# How to Set Up Your Profile

This guide will walk you through setting up your professional profile on InvestMatch.

## Time Required: 15 minutes
## Difficulty: Beginner

### Steps

1. Initial Setup
   - Go to Profile Settings
   - Click 'Edit Profile'
   - Upload a professional photo

2. Basic Information
   - Enter your full name
   - Add your company name
   - Provide contact details
   - Specify your role

3. Professional Details
   - Add your experience
   - List qualifications
   - Specify areas of expertise
   - Add relevant certifications

4. Investment Preferences
   - Set investment focus
   - Specify fund size range
   - Define risk tolerance
   - Add sector preferences

5. Privacy Settings
   - Set profile visibility
   - Configure contact preferences
   - Adjust notification settings

### Tips
- Use a recent professional photo
- Be specific with your expertise
- Keep information current
- Complete all sections

### Next Steps
- Review your profile
- Add connections
- Start networking"""
    ),
    HowToGuide(
        id="using-ai-list-builder",
        title="How to Use the AI List Builder",
        difficulty="Intermediate",
        estimated_time="20 minutes",
        last_updated="2024-12-08",
        content="""# How to Use the AI List Builder

A step-by-step guide to using the AI List Builder effectively.

## Time Required: 20 minutes
## Difficulty: Intermediate

### Steps

1. Access the Tool
   - Navigate to 'AI List Builder'
   - Review available options
   - Understand search parameters

2. Set Up Search Criteria
   - Choose fund type
   - Set size range
   - Select investment focus
   - Define risk profile

3. Run and Refine Search
   - Execute initial search
   - Review results
   - Adjust parameters
   - Apply additional filters

4. Save and Export
   - Save useful searches
   - Export results
   - Track history
   - Monitor updates

5. Use Analytics
   - Check distributions
   - Review trends
   - Analyze patterns
   - Make adjustments

### Pro Tips
- Start broad, then narrow
- Use multiple filters
- Save effective searches
- Regular updates

### Common Issues
- Too many results? Add filters
- Too few results? Broaden criteria
- Unclear matches? Check parameters"""
    ),
    HowToGuide(
        id="contact-management",
        title="Managing Your Contacts",
        difficulty="Beginner",
        estimated_time="10 minutes",
        last_updated="2024-12-08",
        content="""# Managing Your Contacts

Learn how to effectively manage your professional contacts on InvestMatch.

## Time Required: 10 minutes
## Difficulty: Beginner

### Steps

1. Add Contacts
   - Upload contact list
   - Add individual contacts
   - Import from file
   - Verify information

2. Organize Contacts
   - Create groups
   - Add tags
   - Set categories
   - Add notes

3. Enable Matching
   - Set matching preferences
   - Enable global matching
   - Review match settings
   - Adjust criteria

4. Manage Connections
   - Review matches
   - Send messages
   - Schedule meetings
   - Track interactions

5. Regular Maintenance
   - Update contact info
   - Remove outdated entries
   - Refresh matches
   - Monitor activity

### Best Practices
- Regular updates
- Accurate information
- Proper categorization
- Active engagement

### Tips for Success
- Keep notes current
- Follow up regularly
- Use tags effectively
- Monitor interactions"""
    )
]

@router.get("")
def list_howto_guides() -> List[HowToGuide]:
    """List all how-to guides"""
    _ = get_token()
    return HOWTO_GUIDES

@router.get("/{guide_id}")
def get_howto_guide(guide_id: str) -> HowToGuide:
    """Get a specific how-to guide"""
    _ = get_token()
    for guide in HOWTO_GUIDES:
        if guide.id == guide_id:
            return guide
    raise HTTPException(status_code=404, detail="Guide not found")