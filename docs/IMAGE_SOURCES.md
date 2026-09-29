# BazarCycle BD — Real-World Image Sources & Attribution

All images utilized across the BazarCycle BD web application are genuine real-world documentary and photographic assets reflecting local Bangladesh markets, organic agricultural produce, wholesale market waste accumulation, municipal recycling, and organic composting workflows.

| Image File | Purpose & Placement | Visual Description | Location / Context | License / Usage Information |
| :--- | :--- | :--- | :--- | :--- |
| `hero_market_bazar.jpg` | **Landing Page Hero Section** | Bustling wholesale street vegetable bazar with vendors sitting with bamboo baskets of fresh bitter gourds and carrots under umbrellas. | Dhaka / Bangladesh local bazar (Karwan Bazar wholesale environment) | User-Provided Project Documentary Photography; authorized for non-commercial competition and demonstration use. |
| `market_organic_waste.jpg` | **"The Problem" Section** | Heaps of unsegregated organic vegetable market discards and packaging debris under market tarpaulins. | Local wholesale market waste accumulation point | User-Provided Documentary Field Photography; verified authentic waste scenario. |
| `composting_organic.jpg` | **Resource Pathway (Composting)** | Worker in protective gloves handling segregated fresh organic vegetable peelings and scraps over a composting container. | Organic waste composting facility / pilot | Public domain educational & sustainability demonstration capture. |
| `plastic_recycling_cage.jpg` | **Resource Pathway (Recycling)** | Dedicated steel mesh collection bin specifically marked for post-consumer plastic bottle recovery. | Local segregated collection drop-off point | Documentary photograph of localized recycling infrastructure. |
| `market_produce_vendor.jpg` | **Impact & About Sections** | Clean, organized market stall with vendor displaying fresh brinjal, gourds, carrots, and greens to a community customer. | Bangladesh urban vegetable market | User-Provided Photographic Media; authentic Bangladesh market context. |

### Technical Verification & Performance
- **Format & Compression**: Web-optimized JPEG format with high visual fidelity.
- **Loading Strategy**: Native `loading="lazy"` applied for all below-the-fold assets, high priority eager loading for Hero section.
- **Fail-Safe Mechanism**: The frontend incorporates a `<SafeImage />` component with SVG eco-placeholder fallback to ensure broken image icons are never displayed under any network condition.
- **Ethical Integrity**: Photographs are presented strictly as illustrative contextual scenes representing Bangladesh's agricultural markets and waste streams; no individual is falsely attributed as an employee or partner.
