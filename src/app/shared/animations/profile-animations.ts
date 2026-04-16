import { createAnimation, Animation } from '@ionic/angular';

export const enterAnimation = (baseEl: HTMLElement): Animation => {
  const root = baseEl.shadowRoot;

  const backdropAnimation = createAnimation()
    .addElement(root?.querySelector('ion-backdrop')!)
    .fromTo('opacity', '0.01', '0.4');

    const wrapperAnimation = createAnimation()
    .addElement(root?.querySelector('.modal-wrapper')!)
    .fromTo('opacity', '0', '1')
    .duration(300);

  // Efecto ola en los elementos internos
  const items = baseEl.querySelectorAll<HTMLElement>(
    'ion-item, ion-button, .form-group, ion-input, ion-label'
  );

  const itemAnimations = Array.from(items).map((el, i) =>
    createAnimation()
      .addElement(el)
      .delay(300 + i * 70)
      .duration(500)
      .easing('cubic-bezier(0.34, 1.56, 0.64, 1)')
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
    .fromTo('opacity', '1', '0');

  return createAnimation()
    .addElement(baseEl)
    .duration(350)
    .addAnimation([backdropAnimation, wrapperAnimation]);
};
