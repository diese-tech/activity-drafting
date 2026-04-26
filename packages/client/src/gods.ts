export const ALL_GODS = [
  'Achilles', 'Agni', 'Aladdin', 'Amaterasu', 'Anhur', 'Anubis', 'Aphrodite',
  'Apollo', 'Ares', 'Artemis', 'Artio', 'Athena', 'Awilix', 'Bacchus',
  'Baron Samedi', 'Bellona', 'Cabrakan', 'Cerberus', 'Cernunnos', 'Chaac',
  'Charon', 'Chiron', 'Cupid', 'Da Ji', 'Danzaburou', 'Discordia', 'Eset',
  'Fenrir', 'Ganesha', 'Geb', 'Gilgamesh', 'Guan Yu', 'Hades', 'Hecate',
  'Hercules', 'Hou Yi', 'Hua Mulan', 'Hun Batz', 'Izanami', 'Janus',
  'Jing Wei', 'Jormungandr', 'Kali', 'Khepri', 'Kukulkan', 'Loki', 'Medusa',
  'Mercury', 'Merlin', 'Mordred', 'Morgan Le Fay', 'Ne Zha', 'Neith',
  'Nemesis', 'Nu Wa', 'Nut', 'Odin', 'Osiris', 'Pele', 'Poseidon',
  'Princess Bari', 'Ra', 'Rama', 'Ratatoskr', 'Scylla', 'Sobek', 'Sol',
  'Sun Wukong', 'Susano', 'Sylvanus', 'Thanatos', 'The Morrigan', 'Thor',
  'Tsukuyomi', 'Ullr', 'Vulcan', 'Xbalanque', 'Yemoja', 'Ymir', 'Zeus',
];

export function godSlug(name: string): string {
  return name.toLowerCase().replace(/['']/g, '').replace(/\s+/g, '-').trim();
}

export const ICON_BASE = 'https://www.smitefire.com/images/v2/god/icon';
