import { Bike } from 'lucide-react'
import Messages from '../../en.json'
import SignUpForm from './SignUpForm'

const SignUpPage: React.FC = () => {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-background md:grid-cols-2">
      {/* Left column: form */}
      <div className="flex flex-col p-6 sm:p-10">
        <div className="mx-auto mt-16 w-full max-w-xl sm:mt-24">
          <div className="flex items-center gap-2 mb-7">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <Bike className="size-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              {Messages.appName}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold text-foreground">
              {Messages.auth.signUp.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {Messages.auth.signUp.subTitle}
            </p>
          </div>

          <div className="mt-6">
            <SignUpForm />
          </div>
        </div>
      </div>

      {/* Right column: marketing panel */}
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
        <span className="text-xs font-medium tracking-wide text-primary-foreground/70 uppercase">
          {Messages.auth.signUp.bannerModo}
        </span>

        <div className="flex flex-col gap-3">
          <h1 className="text-4xl leading-tight font-semibold w-sm">
            {Messages.auth.signUp.bannerTitle}
          </h1>
          <p className="text-primary-foreground/80 w-md">
            {Messages.auth.signUp.bannerSubTitle}
          </p>
        </div>

        <div className="flex gap-8">
          <div>
            <div className="text-2xl font-semibold">
              {Messages.auth.signUp.metric1}
            </div>
            <div className="text-sm text-primary-foreground/70">
              {Messages.auth.signUp.metricDescription1}
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold">
              {Messages.auth.signUp.metric2}
            </div>
            <div className="text-sm text-primary-foreground/70">
              {Messages.auth.signUp.metricDescription2}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
