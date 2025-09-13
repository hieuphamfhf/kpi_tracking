import React from 'react';

export const KPIIcon = ({ className }: { className?: string }) => (
  <img
    src="/icon/icon_kpi_3.png"
    alt="KPI Icon"
    className={className} // Nhận className từ props để hỗ trợ định kiểu từ bên ngoài
    style={{ width: '2em', height: '2em' }}
  />
);


export const DetailTravelIcon = ({ className }: { className?: string }) => (
  <img
    src="/icon/DetailTravelIcon.png"
    alt="Detail Travel Icon"
    className={className}
    style={{ width: '2em', height: '2em' }}
  />

  
);

export const DayTravelIcon = ({ className }: { className?: string }) => (
  <img
    src="/icon/DayTravelIcon.png"
    alt="Day Travel Icon"
    className={className}
    style={{ width: '2em', height: '2em' }}
  />
);

export const PlaneTravelIcon = ({ className }: { className?: string }) => (
  <img
    src="/icon/PlaneTravelIcon.png"
    alt="Plane Travel Icon"
    className={className}
    style={{ width: '2em', height: '2em' }}
  />
);