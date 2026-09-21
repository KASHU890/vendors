(() => {
  const CATALOG = [
    { name: "Pleasure Lip Oil 001, 5 ml", brand: "Pupa Milano", price: "25,000 IQD", category: "Makeup", desc: "Nourishing lip oil that enhances lip shine with a 3D optical effect. Rich and smooth yet light and non-sticky, with a watermelon flavor enriched by elasticity-enhancing watermelon seed oil." },
    { name: "Bleu De Chanel L'Exclusif Parfum", brand: "Chanel", price: "300,000 IQD", category: "Fragrance", desc: "An elegant aromatic fragrance for men. Fragrance notes: amber, woods, labdanum, and sandalwood." },
    { name: "Seapuri Scalpy Hair Serum, 20 ml", brand: "Seapuri", price: "30,000 IQD", category: "Haircare", desc: "A lightweight, non-greasy serum that treats hair loss, strengthens hair roots, and promotes long-term scalp health." },
    { name: "Brow Styling Gel With Peptides, 15 ml", brand: "Ayten", price: "15,000 IQD", category: "Makeup", desc: "An innovative peptide-enriched formula that precisely holds brow hairs in place while promoting healthier, more manageable brow growth." },
    { name: "Limitless Mascara, 10 ml", brand: "Ayten", price: "15,000 IQD", category: "Makeup", desc: "Enhances both length and volume with a precise, curved brush and lightweight formula. Lashes last all day without clumping or smudging." },
    { name: "Eyebrow Serum, 5 ml", brand: "Ayten", price: "18,000 IQD", category: "Makeup", desc: "Clear gel serum enriched with panthenol, green tea water, hyaluronic acids, peptides, and vitamins that nourish hair follicles for healthy, full brows." },
    { name: "Argan Oil Conditioner, 300 ml", brand: "Argan Deluxe", price: "7,750 IQD", category: "Haircare", desc: "Argan oil infused formula that nourishes instantly, adds softness and suppleness, and protects hair fibers against dryness. Suitable for all hair types." },
    { name: "Roll On Lipgloss Strawberry", brand: "Golden Rose", price: "3,500 IQD", category: "Makeup", desc: "Strawberry-flavored roll-on lip gloss that prevents dryness, moisturizes, and gives lips a shiny, attractive look." },
    { name: "Ultra Nourishing Shower Oil, 200 ml", brand: "Rituals", price: "19,000 IQD", category: "Body Care", desc: "Bath oil enriched with Indian rose, sweet almond oil, moringa oil, and coconut oil. Transforms into a silky lather, leaving skin soft and beautiful." },
    { name: "Advanced Protection For Sensitive Skin SPF 50, 50 ml", brand: "Dermolab", price: "15,500 IQD", category: "Skincare", desc: "Light, non-greasy sunscreen combining UV filters and soothing actives for broad-spectrum protection against UVA, UVB, and infrared rays." },
    { name: "Travel Exclusive Make Up Palette", brand: "Clarins", price: "115,500 IQD", category: "Makeup", desc: "Travel palette with all makeup essentials: mini mascara 3 ml, lip comfort oil 2.8 ml, 6 eyeshadows, compact powder, and blush in a travel bag." },
    { name: "Bloom Facial Tonic, 100 ml", brand: "Bloom Dead Sea Life", price: "20,000 IQD", category: "Skincare", desc: "Gentle toner enriched with Dead Sea minerals that removes impurities, rehydrates, and leaves skin refreshed and balanced. Suits all skin types." },
    { name: "Sun Block SPF 30, 100 ml", brand: "Bloom Dead Sea Life", price: "30,000 IQD", category: "Skincare", desc: "Dead Sea mineral sunscreen. Lightweight and non-greasy, absorbs quickly without white residue. Ideal for daily use on all skin types." },
    { name: "Cheirosa 59 Perfume Mist", brand: "Sol De Janeiro", price: "45,000 IQD", category: "Fragrance", desc: "Notes of velvety plum and candied violet, vanilla orchid and whipped amber, with a base of transparent sandalwood and refreshing vetiver." },
    { name: "Bold Citrus EDP, 100 ml", brand: "Hugo Boss", price: "120,000 IQD", category: "Fragrance", desc: "Woody citrus fragrance for men. Top notes of lemon and bergamot, middle of Bourbon geranium and elemi resin, base of vetiver and patchouli." }
  ];

  const SYSTEM_PROMPT = `You are a helpful sales assistant for "Beauty & Fragrance", a luxury beauty store. Use ONLY the product catalog below to answer questions about products, prices, brands, and categories. If asked something not in the catalog, say you don't have that product. Prices are in Iraqi Dinar (IQD). Be concise and friendly.

CATALOG:
${CATALOG.map(p => `- ${p.name} (Brand: ${p.brand}, Category: ${p.category}, Price: ${p.price}). ${p.desc}`).join("\n")}`;

  const chatBody = document.getElementById("chat-body");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatToggle = document.getElementById("chat-toggle");
  const chatPanel = document.getElementById("chat-panel");
  const chatClose = document.getElementById("chat-close");

  function addMsg(text, role) {
    const wrap = document.createElement("div");
    wrap.className = "chat-msg " + role;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    wrap.appendChild(bubble);
    chatBody.appendChild(wrap);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function localAnswer(q) {
    const t = q.toLowerCase();
    const priceAsk = /\b(price|cost|how much|chea|expensive)\b/.test(t);
    const matches = CATALOG.filter(p =>
      p.name.toLowerCase().includes(t) ||
      p.brand.toLowerCase().includes(t) ||
      p.category.toLowerCase().includes(t) ||
      p.desc.toLowerCase().includes(t)
    );
    if (matches.length === 0) return "I couldn't find that in our catalog. Try asking about mascara, lip oil, sunscreen, perfume, conditioner, or a specific brand like Chanel or Rituals.";
    if (priceAsk) {
      return matches.slice(0, 3).map(p => `${p.name} — ${p.price}`).join("\n");
    }
    return matches.slice(0, 3).map(p => `${p.name} (${p.brand}) — ${p.price}. ${p.desc}`).join("\n\n");
  }

  async function askAI(userText) {
    const cfg = window.OPENROUTER_CONFIG || {};
    if (!cfg.apiKey) {
      addMsg("⚠ No API key set yet. Ask me in local mode (I can still answer catalog questions), or add your OpenRouter key to config.js.", "bot");
      return;
    }
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + cfg.apiKey,
          "HTTP-Referer": cfg.siteUrl || location.href,
          "X-Title": cfg.siteName || "Vendors"
        },
        body: JSON.stringify({
          model: cfg.model || "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userText }
          ]
        })
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error("HTTP " + res.status + ": " + err);
      }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      addMsg(text || "Sorry, I got an empty response.", "bot");
    } catch (e) {
      console.error(e);
      addMsg("⚠ AI request failed (" + e.message + "). Falling back to the local catalog assistant:\n\n" + localAnswer(userText), "bot");
    }
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    addMsg(text, "user");
    chatInput.value = "";
    const typing = document.createElement("div");
    typing.className = "chat-msg bot";
    typing.id = "typing";
    typing.innerHTML = '<div class="bubble typing-dots"><span></span><span></span><span></span></div>';
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;
    askAI(text).finally(() => {
      const t = document.getElementById("typing");
      if (t) t.remove();
    });
  });

  chatToggle.addEventListener("click", () => {
    chatPanel.classList.toggle("open");
    chatToggle.classList.toggle("hidden");
  });

  chatClose.addEventListener("click", () => {
    chatPanel.classList.remove("open");
    chatToggle.classList.remove("hidden");
  });
})();