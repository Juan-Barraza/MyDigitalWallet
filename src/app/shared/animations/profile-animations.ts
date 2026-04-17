import { createAnimation, Animation } from '@ionic/angular';

export const enterAnimation = (baseEl: HTMLElement): Animation => {
  const root = baseEl.shadowRoot;

  // Backdrop fade in
  const backdropAnimation = createAnimation()
    .addElement(root?.querySelector('ion-backdrop')!)
    .fromTo('opacity', '0.01', '0.4');

  // Modal sube desde abajo con rebote
  const wrapperAnimation = createAnimation()
    .addElement(root?.querySelector('.modal-wrapper')!)
    .keyframes([
      { offset: 0,    transform: 'translateY(100%)', opacity: '0' },
      { offset: 0.6,  transform: 'translateY(-8%)',  opacity: '1' },
      { offset: 0.8,  transform: 'translateY(4%)',   opacity: '1' },
      { offset: 1,    transform: 'translateY(0%)',   opacity: '1' },
    ]);

  // Elementos internos en cascada (efecto ola)
  const items = baseEl.querySelectorAll<HTMLElement>(
    'ion-item, ion-button, .form-group, ion-input, ion-label'
  );

  const itemAnimations = Array.from(items).map((el, i) =>
    createAnimation()
      .addElement(el)
      .delay(300 + i * 70)           // 70ms entre cada elemento → efecto ola
      .duration(500)
      .easing('cubic-bezier(0.34, 1.56, 0.64, 1)') // spring suave
      .fromTo('transform', 'translateX(-30px)', 'translateX(0px)')
      .fromTo('opacity', '0', '1')
  );

  return createAnimation()
    .addElement(baseEl)
    .duration(600)
    .addAnimation([backdropAnimation, wrapperAnimation, ...itemAnimations]);
};

export const leaveAnimation = (baseEl: HTMLElement): Animation => {
  const root = baseEl.shadowRoot;

  const backdropAnimation = createAnimation()
    .addElement(root?.querySelector('ion-backdrop')!)
    .fromTo('opacity', '0.4', '0.01');

  const wrapperAnimation = createAnimation()
    .addElement(root?.querySelector('.modal-wrapper')!)
    .keyframes([
      { offset: 0,   transform: 'translateY(0%)',   opacity: '1' },
      { offset: 0.3, transform: 'translateY(-5%)',  opacity: '1' },
      { offset: 1,   transform: 'translateY(100%)', opacity: '0' },
    ]);

  return createAnimation()
    .addElement(baseEl)
    .duration(350)
    .addAnimation([backdropAnimation, wrapperAnimation]);
};
