export function formatDateUTC(dateTime: Date) {
    const utcDate = new Date(Date.UTC(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate(), dateTime.getHours(), dateTime.getMinutes()));
    const formattedDate = utcDate.toISOString().split('T')[0];
    //const formattedTime = utcDate.toISOString().split('T')[1].substring(0, 5);
    return `${formattedDate}`;
  }