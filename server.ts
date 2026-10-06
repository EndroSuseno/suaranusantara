import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));

// Shared Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Convert Text to Speech using gemini-3.8-flash-tts
app.post('/api/tts', async (req, res) => {
  try {
    const {
      text,
      voice = 'Kore',
      speakerPersona = 'Mbak Ratih',
      stylePreset = 'edukasi-santai',
      customStyle,
      mode = 'single',
      dualSpeakers,
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Kunci API Gemini (GEMINI_API_KEY) belum disetel di variabel lingkungan.',
      });
    }

    // Single Speaker Mode
    if (mode === 'single') {
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Teks tidak boleh kosong.' });
      }

      // Bangun deskripsi gaya bahasa agar menghasilkan native speaker Indonesia murni
      const baseIndonesianStyle =
        'Penutur asli bahasa Indonesia (native speaker Indonesia). ' +
        'Bicara mengalir sangat alami, luwes, artikulatif, tanpa aksen asing atau irama terjemahan kaku. ' +
        'Gaya tutur seperti manusia yang sedang menjelaskan sesuatu secara langsung dengan nada hangat dan bersahabat.';

      let finalStyle = baseIndonesianStyle;
      if (customStyle && customStyle.trim()) {
        finalStyle += ` Penyesuaian khusus: ${customStyle.trim()}.`;
      } else if (stylePreset === 'edukasi-santai') {
        finalStyle += ' Intonasi edukatif yang ramah, santai, dan jelas seperti pengajar membimbing murid dengan sabar.';
      } else if (stylePreset === 'storyteller') {
        finalStyle += ' Intonasi penuh rasa seperti pencerita yang menghidupkan kisah dengan ritme dan dinamika memikat.';
      } else if (stylePreset === 'lugas-ringkas') {
        finalStyle += ' Artikulasi tegas, lugas, tempo teratur, terfokus pada penjelasan inti yang mudah diserap.';
      } else if (stylePreset === 'obrolan-akrab') {
        finalStyle += ' Sangat santai dan akrab, seperti mengobrol hangat berdua bersama sahabat dekat.';
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.trim(),
                speechMetadata: {
                  style: finalStyle,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.[0];
      const base64Audio = audioPart?.inlineData?.data;
      const mimeType = audioPart?.inlineData?.mimeType || 'audio/wav';

      if (!base64Audio) {
        return res.status(500).json({
          error: 'Model tidak mengembalikan data audio. Silakan coba kembali.',
        });
      }

      return res.json({
        success: true,
        audioBase64: base64Audio,
        mimeType: mimeType,
        model: 'gemini-3.8-flash-tts',
        persona: speakerPersona,
        voice: voice,
      });
    }

    // Dual Speaker Dialogue Mode
    if (mode === 'dual') {
      if (!dualSpeakers || !dualSpeakers.speaker1 || !dualSpeakers.speaker2) {
        return res.status(400).json({
          error: 'Data dialog dua pembicara tidak lengkap.',
        });
      }

      const { speaker1, speaker2 } = dualSpeakers;

      const sp1Name = speaker1.name || 'Ratih';
      const sp2Name = speaker2.name || 'Dimas';
      const sp1Voice = speaker1.voice || 'Kore';
      const sp2Voice = speaker2.voice || 'Puck';

      const sp1Style =
        speaker1.style ||
        'Penutur asli Indonesia wanita, ramah, menjelaskan dengan ceria dan antusias, nada bertutur sangat luwes.';
      const sp2Style =
        speaker2.style ||
        'Penutur asli Indonesia pria, menanggapi secara santai dan penasaran, menyimak dengan tulus.';

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${sp1Name}: ${speaker1.text.trim()}`,
                speechMetadata: {
                  speaker: sp1Name,
                  style: sp1Style,
                },
              },
              {
                text: `${sp2Name}: ${speaker2.text.trim()}`,
                speechMetadata: {
                  speaker: sp2Name,
                  style: sp2Style,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: sp1Name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: sp1Voice },
                  },
                },
                {
                  speaker: sp2Name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: sp2Voice },
                  },
                },
              ],
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.[0];
      const base64Audio = audioPart?.inlineData?.data;
      const mimeType = audioPart?.inlineData?.mimeType || 'audio/wav';

      if (!base64Audio) {
        return res.status(500).json({
          error: 'Model tidak mengembalikan data audio dialog.',
        });
      }

      return res.json({
        success: true,
        audioBase64: base64Audio,
        mimeType: mimeType,
        model: 'gemini-3.8-flash-tts',
      });
    }

    return res.status(400).json({ error: 'Mode tidak valid.' });
  } catch (error: any) {
    console.error('TTS generation error:', error);
    return res.status(500).json({
      error: error?.message || 'Terjadi kesalahan saat memproses suara audio.',
    });
  }
});

// Endpoint: Naturalize / Polishing text into natural spoken Indonesian using gemini-3.8-flash
app.post('/api/naturalize', async (req, res) => {
  try {
    const { text, goal = 'jelas-mengalir' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Teks tidak boleh kosong.' });
    }

    let instructionDetails = '';
    if (goal === 'jelas-mengalir') {
      instructionDetails = 'Fokus pada kejelasan dan keluwesan tutur kata seperti penutur asli Indonesia yang menjelaskan secara lugas tanpa istilah asing yang membingungkan.';
    } else if (goal === 'santai-akrab') {
      instructionDetails = 'Gunakan gaya bahasa santai dan bersahabat tanpa menjadi kasar, sangat cocok untuk obrolan podcast atau penjelasan interaktif.';
    } else if (goal === 'pencerita-mendalam') {
      instructionDetails = 'Buat gaya bertutur deskriptif, kaya emosi, dan berirama indah layaknya seorang pembaca audio book atau pendongeng.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Teks sumber:
"${text.trim()}"

Tugas:
Tulis ulang teks di atas menjadi bahasa tutur lisan Indonesia yang 100% alami (native Indonesian natural speech).
Hindari kata-kata asing atau susunan terjemahan harfiah kaku.
Jadikan seperti manusia asli Indonesia yang sedang menjelaskan sesuatu secara langsung dengan intonasi yang hidup dan nyaman didengar.
${instructionDetails}

Hasilkan HANYA naskah hasil penulisan ulang tanpa kata pengantar, tanda kutip pembuka/penutup tambahan, atau catatan lain.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction:
          'Kamu adalah spesialis naskah tutur lisan bahasa Indonesia asli. Tugasmu adalah mengubah tulisan kaku atau terjemahan menjadi bahasa tutur asli Indonesia yang mengalir luwes, hangat, manusiawi, dan mudah dipahami ketika dibacakan.',
        temperature: 0.7,
      },
    });

    const naturalText = response.text?.trim() || text;

    return res.json({
      success: true,
      naturalText: naturalText,
    });
  } catch (error: any) {
    console.error('Naturalize error:', error);
    return res.status(500).json({
      error: error?.message || 'Gagal menyelaraskan teks ke bahasa tutur alami.',
    });
  }
});

// Endpoint: Generate an explanatory dialogue in Indonesian using gemini-3.8-flash
app.post('/api/generate-dialogue', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Topik tidak boleh kosong.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Buatlah naskah percakapan penjelasan singkat (2 giliran bicara: Speaker 1 bertanya atau membuka topik, Speaker 2 menjelaskan dengan sangat alami layaknya orang Indonesia menjelaskan secara santai dan jelas).
Topik: "${topic.trim()}"

Gunakan Bahasa Indonesia murni yang mengalir, alami, dan enak diucapkan penutur asli.
Boleh gunakan ekspresi wajar seperti <breath> atau jeda natural.

Format output JSON yang wajib dipatuhi:
{
  "speaker1": {
    "name": "Ratih",
    "text": "..."
  },
  "speaker2": {
    "name": "Dimas",
    "text": "..."
  }
}`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text?.trim();
    if (!raw) {
      throw new Error('Tidak ada respon dari model.');
    }

    const parsed = JSON.parse(raw);
    return res.json({ success: true, dialogue: parsed });
  } catch (error: any) {
    console.error('Generate dialogue error:', error);
    return res.status(500).json({
      error: error?.message || 'Gagal membuat naskah dialog.',
    });
  }
});

// Setup Vite middleware for development or static files for production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server SuaraNusantara aktif di http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
