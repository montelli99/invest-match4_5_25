from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any

router = APIRouter(prefix="/kb", tags=["knowledge-base"])

security = HTTPBearer()

def get_token():
    """Get token from request"""
    credentials = security()
    if not credentials:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    return credentials.credentials



class KBArticle(BaseModel):
    id: str
    title: str
    content: str
    category: str
    last_updated: str
    summary: str

# Initialize with core knowledge base articles
KB_ARTICLES = [
    KBArticle(
        id="getting-started",
        title="Getting Started with InvestMatch",
        category="Platform Basics",
        last_updated="2024-12-08",
        summary="Complete guide to getting started with InvestMatch platform",
        content="""# Getting Started with InvestMatch

Welcome to InvestMatch! This guide will help you understand the platform and get started quickly.

## Platform Overview

InvestMatch is a professional networking platform designed specifically for Fund Managers, Capital Raisers, and Limited Partners. Our platform uses advanced AI and matching algorithms to connect you with relevant professionals in the investment community.

## Key Features

1. AI-Powered Matching
2. Contact Management
3. Professional Networking
4. Analytics Dashboard
5. Document Sharing
6. Secure Messaging

## Quick Start Guide

1. Create Your Profile
   - Sign up and verify your email
   - Select your role (Fund Manager, Limited Partner, or Capital Raiser)
   - Complete your professional profile

2. Set Up Your Preferences
   - Define your investment criteria
   - Set your networking preferences
   - Configure privacy settings

3. Start Networking
   - Upload your professional contacts
   - Review AI-suggested matches
   - Connect with potential partners

4. Utilize Platform Tools
   - Use the AI List Builder
   - Access analytics dashboard
   - Share documents securely

## Best Practices

- Keep your profile updated
- Regularly review matches
- Engage with your network
- Monitor your analytics

## Need Help?

- Contact support through the help desk
- Check our how-to guides
- Review knowledge base articles"""
    ),
    KBArticle(
        id="ai-list-builder",
        title="AI List Builder Guide",
        category="Features",
        last_updated="2024-12-08",
        summary="Comprehensive guide to using the AI List Builder feature",
        content="""# AI List Builder Guide

The AI List Builder is a powerful tool designed to help you find and connect with potential investors or investment opportunities.

## Overview

The AI List Builder uses advanced algorithms to search across multiple data sources, creating targeted lists based on your specific criteria.

## Key Features

1. Multi-Source Search
   - Searches across various databases
   - Real-time data updates
   - Comprehensive results

2. Advanced Filtering
   - Fund type
   - Fund size ranges
   - Investment focus
   - Historical returns
   - Risk profiles

3. Search Presets
   - Save common searches
   - Quick access to favorites
   - Customizable parameters

4. Analytics Integration
   - Investment focus distribution
   - Fund size analysis
   - Performance trends
   - Risk assessment

## How to Use

1. Start a Search
   - Enter basic criteria
   - Apply relevant filters
   - Review initial results

2. Refine Results
   - Adjust parameters
   - Sort by relevance
   - Filter by specific criteria

3. Save and Export
   - Save search presets
   - Export results
   - Track search history

4. Monitor Analytics
   - Review distributions
   - Check trends
   - Analyze patterns

## Tips for Success

- Start with broader searches
- Use multiple filters
- Save effective searches
- Regular data refresh

## Best Practices

1. Regular Updates
   - Check source status
   - Refresh data periodically
   - Update saved searches

2. Data Management
   - Export important lists
   - Track changes
   - Monitor trends

3. Optimization
   - Refine search parameters
   - Use analytics insights
   - Save effective presets"""
    ),
    KBArticle(
        id="matching-system",
        title="Understanding the Matching System",
        category="Features",
        last_updated="2024-12-08",
        summary="Detailed explanation of how the matching system works",
        content="""# Understanding the Matching System

InvestMatch's matching system is designed to connect professionals based on multiple criteria and compatibility factors.

## How It Works

The matching system uses advanced algorithms to:
- Analyze profile data
- Compare investment criteria
- Evaluate compatibility
- Calculate match percentages

## Key Components

1. Profile Matching
   - Professional background
   - Investment focus
   - Track record
   - Risk tolerance

2. Criteria Matching
   - Fund type alignment
   - Investment size compatibility
   - Sector focus
   - Geographic preferences

3. Network Matching
   - Common connections
   - Industry overlap
   - Previous interactions
   - Shared interests

## Match Scores

Match percentages are calculated based on:
- Direct criteria matches
- Weighted importance factors
- Historical success patterns
- Network alignment

## Using Match Results

1. Review Matches
   - Check match percentages
   - Review detailed profiles
   - Evaluate compatibility

2. Take Action
   - Connect with matches
   - Schedule meetings
   - Share information

3. Optimize Results
   - Update preferences
   - Refine criteria
   - Expand network

## Best Practices

- Regularly update your profile
- Be specific with criteria
- Engage with matches promptly
- Track successful connections"""
    )
]

@router.get("")
def list_kb_articles() -> List[KBArticle]:
    """List all knowledge base articles"""
    _ = get_token()
    return KB_ARTICLES

@router.get("/{article_id}")
def get_kb_article(article_id: str) -> KBArticle:
    """Get a specific knowledge base article"""
    _ = get_token()
    for article in KB_ARTICLES:
        if article.id == article_id:
            return article
    raise HTTPException(status_code=404, detail="Article not found")

@router.get("/search/{search_query}")
def search_kb_articles(search_query: str) -> List[KBArticle]:
    """Search knowledge base articles based on query"""
    _ = get_token()
    # Convert query to lowercase for case-insensitive search
    search_query = search_query.lower()
    
    # Split query into keywords
    keywords = search_query.split()
    
    # Score each article based on keyword matches
    scored_articles = []
    for article in KB_ARTICLES:
        score = 0
        # Convert article content to lowercase
        title = article.title.lower()
        content = article.content.lower()
        
        # Check title matches (weighted higher)
        for keyword in keywords:
            if keyword in title:
                score += 2
            if keyword in content:
                score += 1
        
        if score > 0:
            scored_articles.append((score, article))
    
    # Sort by score and return top articles
    scored_articles.sort(reverse=True, key=lambda x: x[0])
    return [article for score, article in scored_articles[:5]]