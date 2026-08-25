import { EyeIcon, EyeOffIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'>) {
  const [isVisible, setIsVisible] = React.useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        className={cn('pr-11', className)}
        type={isVisible ? 'text' : 'password'}
      />
      <Button
        aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
        aria-pressed={isVisible}
        className="absolute right-0 top-0"
        onClick={() => setIsVisible((visible) => !visible)}
        onMouseDown={(event) => event.preventDefault()}
        size="icon"
        type="button"
        variant="ghost"
      >
        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  )
}

export { PasswordInput }
