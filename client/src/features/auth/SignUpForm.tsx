import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import Messages from '../../en.json'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const SignUpForm: React.FC = () => {
  return (
    <form>
      <FieldSet>
        <FieldGroup className="**:data-[slot=input]:h-11">
          <Field>
            <FieldLabel
              htmlFor="displayName"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              {Messages.auth.signUp.displayName}
            </FieldLabel>
            <Input
              id="displayName"
              type="displayName"
              placeholder={Messages.placeholders.displayName}
            />
          </Field>

          <Field>
            <FieldLabel
              htmlFor="email"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              {Messages.auth.email}
            </FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder={Messages.placeholders.email}
            />
          </Field>

          <Field>
            <FieldLabel
              htmlFor="password"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              {Messages.auth.password}
            </FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder={Messages.placeholders.password}
            />
          </Field>

          <Button type="submit" className="h-11 w-full px-4 py-2.5">
            {Messages.auth.signUp.createAccount}
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}

export default SignUpForm
