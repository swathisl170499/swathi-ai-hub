(() => {
  const WEBHOOK_URL = ""; // Paste your endpoint (Zapier/Make/Pipedream/etc.) to receive notifications.

  const projectHighlights = [
    {
      name: "Text2SQL Intelligence System",
      summary:
        "Built a multi-agent Text2SQL platform with retrieval and SQL validation to prevent hallucinations and unsafe queries.",
      impact: "Improved SQL accuracy by 35% and reduced manual SQL effort by 80%.",
    },
    {
      name: "Clinical RAG Copilot",
      summary:
        "Designed an agentic RAG copilot for clinical trial evidence retrieval, summarization, and traceable reasoning.",
      impact: "Reduced research turnaround time by 60%.",
    },
    {
      name: "UNSPSC Category Generator",
      summary:
        "Created an LLM-powered product classification workflow that maps supplier items to UNSPSC taxonomy.",
      impact: "Improved catalog quality and reduced manual classification effort.",
    },
  ];

  const resumeVoiceSummary =
    "Hi, I am Lakshmi Swathi Sreedhar, an AI Engineer focused on Generative AI, RAG, and agentic systems. I build production AI products that combine reasoning, retrieval, and reliable backend orchestration. My recent work includes enterprise Text to SQL platforms, clinical RAG copilots, and automation agents that improve accuracy, reduce manual effort, and speed up customer delivery.";

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
        const name = element.getAttribute("data-track");
        sendEvent(name, {
          text: element.textContent?.trim() || "",
          href: element.getAttribute("href") || "",
        });
      });
    });
  };

  const buildProjectReply = () => {
    const lines = projectHighlights.map(
      (project, index) =>
        `${index + 1}. ${project.name}: ${project.summary} Impact: ${project.impact}`,
    );

    return `Here are top projects I built: ${lines.join(" ")} You can open the Projects page for full details.`;
  };

  const replies = [
    {
      matcher: /(resume|cv)/i,
      answer: "You can open my resume from the Resume section. I can also explain a voice summary if you click the voice button below.",
      action: "open_resume",
    },
    {
      matcher: /(project|build|portfolio|what did you build|case study)/i,
      answer: buildProjectReply(),
      action: "projects_explained",
    },
    {
      matcher: /(contact|interview|email|reach)/i,
      answer: "You can email me directly at swathisl@umich.edu or connect on LinkedIn. Happy to share role-specific details.",
      action: "contact",
    },
    {
      matcher: /(voice|speak|audio|tell me about your resume)/i,
      answer: "Sure. Click 'Explain Resume with Voice' and I will narrate a summary.",
      action: "voice_resume",
    },
    {
      matcher: /(experience|role|work|agentic|rag|llm)/i,
      answer: "I have production experience in GenAI, RAG and agentic workflows. I can explain enterprise Text2SQL, clinical copilots, or platform automation depending on your hiring needs.",
      action: "experience",
    },
  ];

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

  const resolveReply = (message) => {
    const found = replies.find(({ matcher }) => matcher.test(message));

    if (found) {
      return found;
    }

    return {
      answer:
        "Thanks! I can help with resume, projects, role fit, and voice summary. Ask me anything and I will guide you.",
      action: "fallback",
    };
  };

  const performAction = (action) => {
    if (action === "open_resume") {
      window.open("assets/Lakshmi_Swathi_Sreedhar_Resume.pdf", "_blank", "noopener,noreferrer");
      return;
    }

    if (action === "open_projects") {
      window.location.href = "projects.html";
      return;
    }

    if (action === "voice_resume") {
      speakResumeSummary();
    }
  };

  const setVoiceStatus = (message) => {
    if (voiceStatus) {
      voiceStatus.textContent = message;
    }
  };

  const selectVoice = () => {
    if (!("speechSynthesis" in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((voice) => /en(-|_)?(US|GB|IN)?/i.test(voice.lang));
    return englishVoice || voices[0] || null;
  };

  const speakResumeSummary = () => {
    if (!("speechSynthesis" in window)) {
      setVoiceStatus("Voice is not supported in this browser.");
      appendMessage("assistant", "Assistant: Voice playback is not supported in this browser, but I can still provide text summary.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(resumeVoiceSummary);
    utterance.rate = 0.98;
    utterance.pitch = 1;
    utterance.volume = 1;

    if (activeVoice) {
      utterance.voice = activeVoice;
    }

    utterance.onstart = () => {
      setVoiceStatus("Speaking resume summary...");
      sendEvent("voice_resume_started");
    };

    utterance.onend = () => {
      setVoiceStatus("Voice summary complete.");
      sendEvent("voice_resume_completed");
    };

    utterance.onerror = () => {
      setVoiceStatus("Voice playback failed. Please try again.");
      sendEvent("voice_resume_failed");
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopResumeVoice = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setVoiceStatus("Voice playback stopped.");
    sendEvent("voice_resume_stopped");
  };

  const initVoice = () => {
    if (!("speechSynthesis" in window)) {
      setVoiceStatus("Voice not available on this browser.");
      return;
    }

    activeVoice = selectVoice();

    window.speechSynthesis.onvoiceschanged = () => {
      activeVoice = selectVoice();
    };

    voiceEnabled = true;
    setVoiceStatus("Voice ready. Click to hear resume summary.");
  };

  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = chatInput.value.trim();

      if (!message) {
        return;
      }

      appendMessage("user", `You: ${message}`);
      sendEvent("assistant_message", { message });

      const reply = resolveReply(message);
      appendMessage("assistant", `Assistant: ${reply.answer}`);
      sendEvent("assistant_reply", { intent: reply.action });

      if (reply.action === "open_resume" || reply.action === "open_projects" || reply.action === "voice_resume") {
        performAction(reply.action);
      }

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

      appendMessage("assistant", "Assistant: Playing my resume summary in voice now.");
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
