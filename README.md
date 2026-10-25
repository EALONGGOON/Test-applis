# WhatsApp Traducteur FR

Extension Chrome/Edge pour **WhatsApp Web** : chaque message écrit dans une autre langue que le français est traduit automatiquement, avec une petite note sous le texte :

> Bonjour, comment vas-tu
> _Traduit de l'arabe · voir l'original_

Cliquer sur la note affiche/masque le message original. Les messages déjà en français ne sont pas touchés.

## Installation

1. Ouvrir `chrome://extensions` et activer le **Mode développeur**.
2. **Charger l'extension non empaquetée** → choisir le dossier `extension/`.
3. Ouvrir <https://web.whatsapp.com> : la traduction est active.

L'icône de l'extension permet d'activer/désactiver la traduction.

## Limites

- Fonctionne uniquement sur WhatsApp Web (l'app mobile officielle ne peut pas être modifiée).
- Utilise le service gratuit non officiel de Google Traduction : le texte des messages est envoyé à Google.
- Si WhatsApp modifie sa page, le sélecteur `MSG_SELECTOR` de `extension/content.js` peut devoir être ajusté.
