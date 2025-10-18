import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

export type FilterOption = {
  label: string
  value: string
}

interface FilterPopoverProps {
  title?: string
  options: FilterOption[]
  selectedValues?: string[]
  onSelect: (value: string) => void
  onClear: () => void
}

export default function FilterPopover({
  title,
  options,
  selectedValues = [],
  onSelect,
  onClear,
}: FilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="text-lg bg-white py-6 min-w-[180px] justify-between font-normal rounded-md"
        >
          <div className="flex gap-1">
            {title}
            {selectedValues?.length > 0 && (
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {selectedValues.length}
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0 bg-white" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="overflow-auto h-full flex-1">
              {options.map(option => {
                const isSelected = selectedValues.includes(option.value)
                return (
                  <CommandItem key={option.value} onSelect={() => onSelect(option.value)}>
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center rounded-[4px] border',
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-input [&_svg]:invisible'
                      )}
                    >
                      <Check className="text-primary-foreground size-3.5" />
                    </div>
                    <span className="text-base">{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.length > 0 && onClear && (
              <>
                <CommandSeparator className="border-gray-200 border-b" />
                <CommandGroup>
                  <CommandItem onSelect={onClear} className="justify-center text-center text-base">
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
