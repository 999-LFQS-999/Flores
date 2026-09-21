/**
 * FLORALIA STUDIO - SHARE & CUSTOM GIFT LINK GENERATOR
 */

import { $, showToast, buildShareUrl } from '../utils/helpers.js';
import { audio } from '../audioManager.js';

export class ShareModal {
  constructor(getAppState) {
    this.getAppState = getAppState;
    this.recipientInput = $('#share-input-para');
    this.senderInput = $('#share-input-de');
    this.messageInput = $('#share-input-mensaje');
    this.linkDisplay = $('#share-generated-url');
    this.copyBtn = $('#btn-copy-share-url');
    this.whatsappBtn = $('#btn-share-whatsapp');
    this.qrImage = $('#share-qr-image');

    this.init();
  }

  init() {
    if (!this.linkDisplay) return;
    this.setupListeners();
  }

  setupListeners() {
    const updateUrl = () => {
      const state = this.getAppState ? this.getAppState() : {};
      const url = buildShareUrl({
        para: this.recipientInput ? this.recipientInput.value.trim() : '',
        de: this.senderInput ? this.senderInput.value.trim() : '',
        mensaje: this.messageInput ? this.messageInput.value.trim() : '',
        mundo: state.mundo || 'sunflower',
        regalo: this.isGiftCheckbox ? this.isGiftCheckbox.checked : false
      });

      if (this.linkDisplay) this.linkDisplay.value = url;

      if (this.qrImage && url) {
        this.qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
        this.qrImage.style.display = 'block';
      }
    };

    [this.recipientInput, this.senderInput, this.messageInput, this.isGiftCheckbox].forEach(el => {
      if (el) el.addEventListener('input', updateUrl);
    });

    if (this.copyBtn) {
      this.copyBtn.addEventListener('click', () => {
        if (this.linkDisplay) {
          navigator.clipboard.writeText(this.linkDisplay.value);
          audio.playChime(1.5);
          showToast('¡Enlace floral copiado al portapapeles! 📋✨', '💛');
        }
      });
    }

    if (this.whatsappBtn) {
      this.whatsappBtn.addEventListener('click', () => {
        const text = encodeURIComponent(`Te he preparado un regalo muy especial con flores amarillas y amor 🌻💛: ${this.linkDisplay ? this.linkDisplay.value : ''}`);
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
      });
    }
  }

  openWithData(data = {}) {
    if (data.para && this.recipientInput) this.recipientInput.value = data.para;
    if (data.de && this.senderInput) this.senderInput.value = data.de;
    if (data.mensaje && this.messageInput) this.messageInput.value = data.mensaje;

    const state = this.getAppState ? this.getAppState() : {};
    const url = buildShareUrl({
      para: data.para || '',
      de: data.de || '',
      mensaje: data.mensaje || '',
      mundo: state.mundo || 'sunflower',
      regalo: true
    });

    if (this.linkDisplay) this.linkDisplay.value = url;
    if (this.qrImage && url) {
      this.qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      this.qrImage.style.display = 'block';
    }
  }
}
