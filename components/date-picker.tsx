
import * as React from 'react'
import {format} from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { SelectSingleEventHandler } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

type Props = {
    value?: Date
    onChange?: SelectSingleEventHandler
    disabled?: boolean
}

export const DatePicker = ({value, onChange, disabled}: Props) => {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !value && 'text-muted-foreground',
                    )}
                    onClick={() => setOpen((open) => !open)}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 size-4" />
                    {value ? format(value, 'PPP') : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    defaultMonth={value}
                    selected={value}
                    onSelect={onChange}
                    disabled={disabled}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}