from fastapi import APIRouter

router = APIRouter()

@router.get("/stats")
async def get_stats():
    stats = [
        {
            "icon": "Users",
            "number": "50K+",
            "label": "Active Users",
            "description": "Trusting our AI assistant"
        },
        {
            "icon": "DollarSign",
            "number": "$2.5M+",
            "label": "Money Saved",
            "description": "By our users last month"
        },
        {
            "icon": "TrendingUp",
            "number": "15%",
            "label": "Average ROI",
            "description": "Improvement with AI insights"
        },
        {
            "icon": "Award",
            "number": "98%",
            "label": "Satisfaction Rate",
            "description": "From our happy users"
        }
    ]
    return stats

@router.get("/testimonials")
async def get_testimonials():
    testimonials = [
        {
            "name": "Sarah Johnson",
            "role": "Marketing Director",
            "company": "Tech Innovations Inc.",
            "content": "FinanceAI has completely transformed how I manage my money. The AI insights helped me save an extra $800 per month!",
            "rating": 5,
            "avatar": "SJ"
        },
        {
            "name": "Michael Chen",
            "role": "Software Engineer",
            "company": "StartupXYZ",
            "content": "The investment recommendations are incredibly accurate. I've seen a 22% return on my portfolio since using this app.",
            "rating": 5,
            "avatar": "MC"
        },
        {
            "name": "Emily Rodriguez",
            "role": "Small Business Owner",
            "company": "Local Boutique",
            "content": "As a business owner, keeping track of both personal and business finances was overwhelming. This AI assistant makes it seamless.",
            "rating": 5,
            "avatar": "ER"
        }
    ]
    return testimonials
