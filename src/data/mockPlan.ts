import type { EventPlan } from "../types/plan";

export const mockPlan: EventPlan = {
  total_estimated_cost: 12500,
  generated_for: "Demo Event",
  guest_count: 50,
  budget_target: 15000,
  notes: "This is a mock plan for preview purposes.",
  theme_summary: {
    title: "Urban Ethereal Engagement",
    description: "An intimate yet sophisticated celebration blending modern industrial aesthetics with warm, romantic touches. This plan focuses on creating a seamless flow between social mingling and structured highlights, ensuring a memorable experience for 40 guests in the heart of Toronto.",
    vibe: "Elegant, warm, modern, culturally thoughtful",
    location: "The Glass House, Toronto, ON"
  },
  itinerary: [
    {
      time: "6:00 PM",
      title: "Guest Arrival & Welcome Drinks",
      description: "Guests arrive to a curated playlist and are greeted with signature cocktails reflecting the couple's heritage.",
      icon: "🥂"
    },
    {
      time: "6:45 PM",
      title: "Couple's Grand Entrance",
      description: "A brief, high-energy moment to welcome the couple into the main celebration space.",
      icon: "✨"
    },
    {
      time: "7:00 PM",
      title: "Dinner Service",
      description: "A multi-course fusion menu served family-style to encourage conversation and community.",
      icon: "🍽️"
    },
    {
      time: "8:30 PM",
      title: "Speeches & Champagne Toast",
      description: "Heartfelt words from family and close friends, followed by a collective toast to the couple.",
      icon: "🎤"
    },
    {
      time: "9:15 PM",
      title: "Cake Cutting & Dessert Buffet",
      description: "Unveiling the custom-designed cake alongside a selection of artisanal local pastries.",
      icon: "🍰"
    },
    {
      time: "10:00 PM",
      title: "Music, Photos & Final Toast",
      description: "Open floor for dancing and candid photography. The night concludes with a final thank-you from the couple.",
      icon: "🎶"
    }
  ],
  budget_matrix: [
    {
      item: "Venue Rental",
      category: "Location",
      estimated_cost: 850,
      notes: "Includes basic AV and furniture setup."
    },
    {
      item: "Fusion Catering",
      category: "Food & Beverage",
      estimated_cost: 1200,
      notes: "Based on 40 guests, family-style service."
    },
    {
      item: "Floral & Decor",
      category: "Design",
      estimated_cost: 400,
      notes: "Minimalist urban theme with dried and fresh elements."
    },
    {
      item: "Professional Photography",
      category: "Memories",
      estimated_cost: 300,
      notes: "4 hours of coverage with digital gallery."
    },
    {
      item: "Live Acoustic Duo",
      category: "Entertainment",
      estimated_cost: 200,
      notes: "For welcome drinks and dinner."
    },
    {
      item: "Custom Two-Tier Cake",
      category: "Food & Beverage",
      estimated_cost: 150,
      notes: "Modern design with gold leaf accents."
    },
    {
      item: "Contingency Fund",
      category: "Miscellaneous",
      estimated_cost: -100,
      notes: "Reserved for unexpected expenses (adjusted to keep total at $3000)."
    }
  ],
  recommendations: [
    {
      type: "Venue",
      title: "The Glass House Toronto",
      description: "A stunning loft space with floor-to-ceiling windows and exposed brick, perfect for the modern industrial vibe."
    },
    {
      type: "Catering",
      title: "Harvest Kitchen Fusion",
      description: "Specializes in blending diverse culinary traditions, ideal for your cultural preferences."
    },
    {
      type: "Decor",
      title: "Wild Bloom Studio",
      description: "Known for their architectural floral designs that perfectly complement industrial spaces."
    },
    {
      type: "Music",
      title: "Velvet Strings",
      description: "An acoustic duo that can transition from classical elegance to modern hits seamlessly."
    },
    {
      type: "Photography",
      title: "Loom & Light",
      description: "Experts in candid, warm-toned photography that captures the genuine emotion of the evening."
    }
  ]
};

// Adjusting budget to match exactly 3000 as requested by the user for the prompt
mockPlan.budget_matrix[6].estimated_cost = 3000 - mockPlan.budget_matrix.slice(0, 6).reduce((sum, item) => sum + item.estimated_cost, 0);
