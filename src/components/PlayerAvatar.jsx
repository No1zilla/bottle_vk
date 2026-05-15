import React from 'react';
import { Avatar } from '@vkontakte/vkui';

export default function PlayerAvatar({ player, size = 48, highlight = false }) {
  const initials = (player.name || player.first_name || '?').slice(0, 1).toUpperCase();
  const photo = player.photo_100 || player.photo || '';

  return (
    <Avatar
      size={size}
      src={photo || undefined}
      initials={!photo ? initials : undefined}
      style={highlight ? { boxShadow: '0 0 0 3px #ff5252' } : undefined}
    />
  );
}
