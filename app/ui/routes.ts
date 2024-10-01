
  // export const links = [
  //   // { id: 1, name: 'Home', href: `http://localhost:3000/home` },
  //   // { id: 2, name: 'Test', href: `http://localhost:3000/test` },
  //   { id: 1, name: '每月訓練課程查詢', href: `http://localhost:3000/training` },
  //   { id: 2, name: '4.1借用卡表', href: `http://localhost:3000/BorrowCard` },
  //   { id: 3, name: '4.2忘刷卡表', href: `http://localhost:3000/FollowUpReminder` },
  //   { id: 4, name: '多次催辦案件查詢', href: `http://localhost:3000/FollowUpReminder` },
  //   { id: 5, name: '加班未於事前填單查詢', href: `http://localhost:3000/FollowUpReminder` },
    
    
    
    
  // ];

  // Importing Heroicons
// @ts-ignore
// Import icons from Radix UI
import { ReloadIcon, CardStackIcon } from '@radix-ui/react-icons';
import { AcademicCapIcon ,ClockIcon,BellIcon } from '@heroicons/react/24/outline';
// Update your links with corresponding icons
export const links = [
  { id: 1, name: '2_每月訓練課程查詢', href: `http://localhost:3000/training`, icon: AcademicCapIcon  },
  { id: 2, name: '4.1借用卡表', href: `http://localhost:3000/BorrowCard`, icon: CardStackIcon },
  { id: 3, name: '4.2忘刷卡表', href: `http://localhost:3000/ForgetSenseCard`, icon:  ReloadIcon},
  { id: 4, name: '3.1多次催辦案件查詢', href: `http://localhost:3000/FollowUpReminder`, icon:BellIcon  }, // Repeat action icon
  { id: 5, name: '5_加班未於事前填單查詢', href: `http://localhost:3000/OverTimeDuty`, icon: ClockIcon  }, // Time-related icon
];


// import { FileTextIcon, BellIcon, CardStackIcon, ClockIcon, StopwatchIcon } from '@radix-ui/react-icons';
// import ForgetSenseCardTable from './../(pages)/ForgetSenseCard/ForgetSenseCardTable';
// import OverTimeDutyTable from './../(pages)/OverTimeDuty/OverTimeDutyTable';

// export const links = [
//   { id: 1, name: 'TrainingTable', href: `http://localhost:3000/training`, icon: FileTextIcon },
//   { id: 2, name: 'FollowUpReminder', href: `http://localhost:3000/FollowUpReminder`, icon: BellIcon },
//   { id: 3, name: 'BorrowCard', href: `http://localhost:3000/BorrowCard`, icon: CardStackIcon },
//   { id: 4, name: 'ForgottenCheckIn', href: `http://localhost:3000/ForgottenCheckIn`, icon: ClockIcon },
//   { id: 5, name: 'OvertimeWithoutPreApproval', href: `http://localhost:3000/OvertimeWithoutPreApproval`, icon: StopwatchIcon },
// ];
