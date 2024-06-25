import { format } from "date-fns"

export const date = () => {
    var date = new Date(Date.now());
    date.toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' })
    const new_date = format(date, 'dd/MM/yyyy HH:mm:ii')
    return new_date
}