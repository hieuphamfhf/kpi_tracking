

import { GraduationCapIcon,IdCardIcon,ClockAlertIcon ,BellRingIcon, CircleHelpIcon, CalendarClock} from "lucide-react";
import ReamingLeaveTimeTable from './../(pages)/ReamingLeaveTime/ReamingLeaveTimeTable';
// Update your links with corresponding icons
export const links = [
  { id: 1, name: '1_剩餘換休未休時數報表', href: `http://localhost:3000/ReamingLeaveTime`, icon: CalendarClock  },
  { id: 2, name: '2_每月訓練課程查詢', href: `http://localhost:3000/training`, icon: GraduationCapIcon  },
  { id: 3, name: '3.1多次催辦案件查詢', href: `http://localhost:3000/FollowUpReminder`, icon:BellRingIcon  }, // Repeat action icon
  { id: 4, name: '4.1借用卡表', href: `http://localhost:3000/BorrowCard`, icon: IdCardIcon },
  { id: 5, name: '4.2忘刷卡表', href: `http://localhost:3000/ForgetSenseCard`, icon:  CircleHelpIcon},
  { id: 6, name: '5_加班未於事前填單查詢', href: `http://localhost:3000/OverTimeDuty`, icon: ClockAlertIcon  }, // Time-related icon
];
