import React from 'react';

export const KPIIcon = ({ className }: { className?: string }) => (
  <img
    src="/icon/icon_kpi_3.png"
    alt="KPI Icon"
    className={className} // Nhận className từ props để hỗ trợ định kiểu từ bên ngoài
    style={{ width: '2em', height: '2em' }}
  />
);