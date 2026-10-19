import React from 'react';

interface Props {
  onClick: () => void;
  children: React.ReactNode;
}

// Título clickeable de una tarjeta: es un <button> real (se llega con Tab y se activa con Enter/Espacio)
// y su ::after se estira sobre toda la tarjeta (que tiene que ser `relative`), así el click en
// cualquier parte de la tarjeta sigue funcionando sin anidar contenido interactivo.
export const CardButton: React.FC<Props> = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="block w-full truncate text-left cursor-pointer focus:outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-brand"
  >
    {children}
  </button>
);
