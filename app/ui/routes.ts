
import { GraduationCapIcon,IdCardIcon,ClockAlertIcon ,BellRingIcon, CircleHelpIcon, CalendarClock, ChartNoAxesCombined,CircleUser} from "lucide-react";
// Update your links with corresponding icons
// import { KPIIcon} from '../../components/ui/icons';
export const links = [
  { id: 1, name: '1_剩餘換休未休時數報表', href: `http://localhost:3000/ReamingLeaveTime`, icon: CalendarClock  },
  { id: 2, name: '2_每月訓練課程查詢', href: `http://localhost:3000/training`, icon: GraduationCapIcon  },
  { id: 3, name: '3.1多次催辦案件查詢', href: `http://localhost:3000/FollowUpReminder`, icon:BellRingIcon  }, // Repeat action icon
  { id: 4, name: '4.1借用卡表', href: `http://localhost:3000/BorrowCard`, icon: IdCardIcon },
  { id: 5, name: '4.2忘刷卡表', href: `http://localhost:3000/ForgetSenseCard`, icon:  CircleHelpIcon},
  { id: 6, name: '5_加班未於事前填單查詢', href: `http://localhost:3000/OverTimeDuty`, icon: ClockAlertIcon  }, // Time-related icon
  // {id: 7, name: '6_每月各部人事KPI統計表', href: `http://localhost:3000/MonthlyKPI`, icon: KPIIcon  }, // Time-related icon
  { id: 7, name: '8_探親單查詢畫面', href: `http://localhost:3000/FamilyVisit`, icon: CircleUser , onlyManager: true }, // Time-related icon
  { id: 8, name: '9_高階主管行蹤查詢', href: `http://localhost:3000/ManagerReturnStatus`, icon: CircleUser , onlyManager: true }, // Time-related icon
  {id: 9, name: '6_每月各部人事KPI統計表', href: `http://localhost:3000/MonthlyKPI`, icon: ChartNoAxesCombined  }, // Time-related icon
  
];

