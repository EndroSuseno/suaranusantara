export interface SpeakerPersona {
  id: string;
  name: string;
  voice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon';
  gender: 'Wanita' | 'Pria';
  tone: string;
  tagline: string;
  description: string;
  avatarBg: string;
  bestFor: string;
}

export interface StylePreset {
  id: string;
  label: string;
  description: string;
  promptAddon: string;
  icon: string;
}

export interface TextSample {
  id: string;
  title: string;
  category: string;
  personaId: string;
  styleId: string;
  text: string;
  explanation: string;
}

export interface GeneratedAudioItem {
  id: string;
  createdAt: number;
  text: string;
  personaName: string;
  voice: string;
  styleName: string;
  audioBase64: string;
  mimeType: string;
  duration?: number;
  mode: 'single' | 'dual';
}
