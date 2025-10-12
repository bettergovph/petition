import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
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
import { Separator } from '../ui/separator'

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
        <Button variant="outline" className="text-lg py-6">
          {title}
          {selectedValues?.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.length}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selectedValues.length > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.length} selected
                  </Badge>
                ) : (
                  options
                    .filter(option => selectedValues.includes(option.value))
                    .map(option => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0 bg-white" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList className="max-h-[400px]">
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
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.length > 0 && onClear && (
              <>
                <CommandSeparator className="border-gray-200 border-b" />
                <CommandGroup>
                  <CommandItem onSelect={onClear} className="justify-center text-center">
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
