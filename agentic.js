(() => {
  const WEBHOOK_URL = ""; // Paste your endpoint (Zapier/Make/Pipedream/etc.) to receive notifications.

  const projects = [
    {
      id: "text2sql",
      name: "Text2SQL Intelligence System",
      whatBuilt:
        "I built a multi-agent Text2SQL system with schema retrieval, SQL generation, validation, and safe execution guards.",
      impact: "It improved SQL accuracy by 35% and reduced manual SQL work by 80%.",
      tags: ["sql", "text2sql", "database", "enterprise", "rag", "langchain", "dspy"],
      href: "projects.html",
    },
    {
      id: "clinical_rag",
      name: "Clinical RAG Copilot",
      whatBuilt:
        "I built a clinical trial copilot that retrieves, summarizes, and cites relevant evidence using agentic RAG.",
      impact: "It reduced clinical research turnaround by 60% and improved traceability.",
      tags: ["clinical", "healthcare", "medical", "rag", "copilot", "faiss", "vertex"],
      href: "projects.html",
    },
    {
      id: "gan_synthetic",
      name: "GAN-Based Customer Data Generation",
      whatBuilt:
        "I developed a GAN pipeline to generate realistic synthetic customer datasets for privacy-safe model training.",
      impact: "It enabled safer experimentation when real data access was limited.",
      tags: ["gan", "synthetic", "privacy", "tensorflow", "data"],
      href: "projects.html",
    },
    {
      id: "turtlebot",
      name: "Autonomous-Driving TurtleBot",
      whatBuilt:
        "I built an autonomous TurtleBot using SLAM, computer vision, and reinforcement learning for navigation.",
      impact: "It demonstrated robust obstacle avoidance and path planning.",
      tags: ["robotics", "slam", "opencv", "autonomous", "turtlebot", "ros"],
      href: "projects.html",
    },
    {
      id: "health_monitor",
      name: "Health Monitoring Alert System",
      whatBuilt:
        "I built a wearable-health anomaly detection pipeline with predictive alerts and monitoring dashboards.",
      impact: "It improved early detection capability for physiological anomalies.",
      tags: ["health", "wearable", "anomaly", "monitoring", "predictive"],
      href: "projects.html",
    },
    {
      id: "unspsc",
      name: "AI-Powered UNSPSC Category Generator",
      whatBuilt:
        "I built an LLM classification engine that maps supplier items to UNSPSC hierarchy using semantic + rules.",
      impact: "It reduced manual catalog classification effort and improved taxonomy quality.",
      tags: ["classification", "taxonomy", "unspsc", "llm", "catalog"],
      href: "projects.html",
    },
    {
      id: "segmentation",
      name: "Semantic Segmentation for Autonomous Driving",
      whatBuilt:
        "I implemented a U-Net segmentation model for lane, vehicle, and pedestrian detection in driving scenes.",
      impact: "It improved multi-class scene understanding for autonomy-focused workflows.",
      tags: ["segmentation", "computer vision", "unet", "autonomous", "driving"],
      href: "projects.html",
    },
  ];

  const resumeVoiceSummary =
    "Hi, I am Lakshmi Swathi Sreedhar. I am an AI Engineer focused on Generative AI, RAG, and agentic systems. I build production AI platforms that combine reasoning, retrieval, and reliable backend orchestration. My work includes enterprise Text to SQL systems, clinical RAG copilots, and automation agents that reduce manual effort and improve decision speed.";

  const FEMALE_VOICE_HINTS = [
    "female",
    "woman",
    "zira",
    "samantha",
    "karen",
    "moira",
    "ava",
    "aria",
    "jenny",
    "google us english",
    "serena",
  ];

  let voiceEnabled = false;
  let activeVoice = null;

  const sendEvent = (eventName, metadata = {}) => {
    const payload = {
      eventName,
      metadata,
      page: window.location.pathname,
      title: document.title,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || "direct",
      userAgent: navigator.userAgent,
      language: navigator.language,
    };

    if (!WEBHOOK_URL) {
      console.info("[analytics disabled]", payload);
      return;
    }

    const body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(WEBHOOK_URL, blob);
      return;
    }

    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch((error) => {
      console.error("event delivery failed", error);
    });
  };

  const trackClicks = () => {
    document.querySelectorAll("[data-track]").forEach((element) => {
      element.addEventListener("click", () => {
        const name = element.getAttribute("data-track") || "unknown_click";
        sendEvent(name, {
          text: element.textContent?.trim() || "",
          href: element.getAttribute("href") || "",
        });
      });
    });
  };

  const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");

  const getBestProjectMatches = (query) => {
    const cleanedQuery = normalize(query);

    const scored = projects
      .map((project) => {
        const haystack = `${project.name} ${project.tags.join(" ")} ${project.whatBuilt} ${project.impact}`.toLowerCase();
        let score = 0;

        project.tags.forEach((tag) => {
          if (cleanedQuery.includes(tag)) {
            score += 4;
          }
        });

        cleanedQuery.split(/\s+/).forEach((token) => {
          if (token.length > 2 && haystack.includes(token)) {
            score += 1;
          }
        });

        return { project, score };
      })
      .sort((a, b) => b.score - a.score);

    const topScore = scored[0]?.score || 0;

    if (topScore <= 0) {
      return projects.slice(0, 2);
    }

    return scored
      .filter((item) => item.score >= Math.max(2, topScore - 2))
      .slice(0, 3)
      .map((item) => item.project);
  };

  const buildProjectResponse = (query) => {
    const matches = getBestProjectMatches(query);
    const details = matches
      .map((project, index) => `${index + 1}. ${project.name}: ${project.whatBuilt} ${project.impact}`)
      .join(" ");

    return {
      answer: `Based on your query, these are the best matching projects: ${details} You can ask me to go deeper into any one project.`,
      intent: "project_query_explained",
      metadata: {
        query,
        matchedProjectIds: matches.map((project) => project.id),
      },
    };
  };

  const chatForm = document.getElementById("agentic-form");
  const chatInput = document.getElementById("agentic-input");
  const chatLog = document.getElementById("agentic-log");
  const voiceBtn = document.getElementById("voice-resume-btn");
  const stopVoiceBtn = document.getElementById("voice-stop-btn");
  const voiceStatus = document.getElementById("voice-status");

  const appendMessage = (speaker, text) => {
    if (!chatLog) return;
    const item = document.createElement("p");
    item.className = `message ${speaker}`;
    item.textContent = text;
    chatLog.appendChild(item);
    chatLog.scrollTop = chatLog.scrollHeight;
  };

  const setVoiceStatus = (message) => {
    if (voiceStatus) {
      voiceStatus.textContent = message;
    }
  };

  const chooseFemalePreferredVoice = () => {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();

    if (!voices.length) return null;

    const femaleNamed = voices.find((voice) => {
      const name = `${voice.name} ${voice.lang}`.toLowerCase();
      return FEMALE_VOICE_HINTS.some((hint) => name.includes(hint));
    });

    if (femaleNamed) return femaleNamed;

    const englishVoice = voices.find((voice) => /en(-|_)?(us|gb|in)?/i.test(voice.lang));
    return englishVoice || voices[0] || null;
  };

  const speakResumeSummary = () => {
    if (!("speechSynthesis" in window)) {
      setVoiceStatus("Voice is not supported in this browser.");
      appendMessage("assistant", "Assistant: Voice is not supported here, but I can still explain everything in text.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(resumeVoiceSummary);
    utterance.rate = 0.96;
    utterance.pitch = 1.12;
    utterance.volume = 1;

    if (activeVoice) {
      utterance.voice = activeVoice;
    }

    utterance.onstart = () => {
      setVoiceStatus(`Speaking resume summary${activeVoice ? ` (${activeVoice.name})` : ""}...`);
      sendEvent("voice_resume_started", { voice: activeVoice?.name || "default" });
    };

    utterance.onend = () => {
      setVoiceStatus("Voice summary complete.");
      sendEvent("voice_resume_completed", { voice: activeVoice?.name || "default" });
    };

    utterance.onerror = () => {
      setVoiceStatus("Voice playback failed. Please try again.");
      sendEvent("voice_resume_failed", { voice: activeVoice?.name || "default" });
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopResumeVoice = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setVoiceStatus("Voice playback stopped.");
    sendEvent("voice_resume_stopped", { voice: activeVoice?.name || "default" });
  };

  const initVoice = () => {
    if (!("speechSynthesis" in window)) {
      setVoiceStatus("Voice not available in this browser.");
      return;
    }

    activeVoice = chooseFemalePreferredVoice();

    window.speechSynthesis.onvoiceschanged = () => {
      activeVoice = chooseFemalePreferredVoice();
      if (activeVoice) {
        setVoiceStatus(`Female-preferred voice ready: ${activeVoice.name}`);
      }
    };

    voiceEnabled = true;
    if (activeVoice) {
      setVoiceStatus(`Female-preferred voice ready: ${activeVoice.name}`);
    } else {
      setVoiceStatus("Voice ready (browser default). Female voice not found on this device.");
    }
  };

  const handleMessage = (message) => {
    const lower = message.toLowerCase();

    if (/(project|build|portfolio|case study|healthcare|robotics|sql|rag|vision|gan|unspsc)/i.test(lower)) {
      return buildProjectResponse(message);
    }

    if (/(resume|cv)/i.test(lower)) {
      return {
        answer: "You can open my resume from the Resume section. If you want, click 'Explain Resume with Voice' and I will narrate a concise summary.",
        intent: "resume_help",
      };
    }

    if (/(voice|speak|audio|narrate)/i.test(lower)) {
      return {
        answer: "Sure. Click 'Explain Resume with Voice' to hear a female-preferred voice summary.",
        intent: "voice_help",
      };
    }

    if (/(contact|interview|email|reach|hire)/i.test(lower)) {
      return {
        answer: "You can reach me at swathisl@umich.edu or on LinkedIn. I can also suggest projects by role if you tell me the role.",
        intent: "contact_help",
      };
    }

    return {
      answer:
        "I can help with project explanations, role fit, and resume voice summary. Try asking: 'Explain your healthcare project' or 'Explain your SQL project'.",
      intent: "fallback",
    };
  };

  const performIntentAction = (intent) => {
    if (intent === "resume_help") {
      window.open("assets/Lakshmi_Swathi_Sreedhar_Resume.pdf", "_blank", "noopener,noreferrer");
      return;
    }

    if (intent === "voice_help") {
      speakResumeSummary();
    }
  };

  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = chatInput.value.trim();
      if (!message) return;

      appendMessage("user", `You: ${message}`);
      sendEvent("assistant_message", { message });

      const reply = handleMessage(message);
      appendMessage("assistant", `Assistant: ${reply.answer}`);
      sendEvent("assistant_reply", {
        intent: reply.intent,
        ...(reply.metadata || {}),
      });

      performIntentAction(reply.intent);
      chatInput.value = "";
    });
  }

  document.querySelectorAll("[data-agentic-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      const prompt = button.getAttribute("data-agentic-prompt") || "";
      if (!prompt || !chatInput || !chatForm) return;
      chatInput.value = prompt;
      chatForm.requestSubmit();
    });
  });

  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      if (!voiceEnabled) {
        initVoice();
      }

      appendMessage("assistant", "Assistant: Playing resume summary now using female-preferred voice when available.");
      sendEvent("voice_resume_clicked");
      speakResumeSummary();
    });
  }

  if (stopVoiceBtn) {
    stopVoiceBtn.addEventListener("click", () => {
      stopResumeVoice();
    });
  }

  initVoice();
  sendEvent("page_view");
  trackClicks();
})();
