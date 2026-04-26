import Link, { type LinkProps } from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'outline';

type BaseButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
};

type ButtonAsButtonProps = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type ButtonAsLinkProps = BaseButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  Omit<LinkProps, 'href'> & {
    href: string;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const baseStyles =
  'inline-flex items-center justify-center rounded-full px-8 py-3 font-sans text-[11px] font-semibold uppercase tracking-[3.5px] transition-all duration-300';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#F4EEE8] text-[#2A2521] shadow-[0_14px_34px_rgba(0,0,0,0.28)] hover:bg-white disabled:bg-[#F4EEE8]/70',
  outline:
    'border border-[#F4EEE8]/40 text-[#F4EEE8]/90 hover:border-[#F4EEE8] hover:text-[#F4EEE8]',
};

const disabledStyles = 'disabled:cursor-not-allowed disabled:opacity-60';

const joinClassNames = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(' ');

export const Button = (props: ButtonProps) => {
  const { className, children, variant = 'primary' } = props;

  const composedClassName = joinClassNames(baseStyles, variantStyles[variant], disabledStyles, className);

  if (typeof props.href === 'string') {
    const { href, ...linkProps } = props;

    return (
      <Link href={href} className={composedClassName} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { type = 'button', ...buttonProps } = props;

  return (
    <button type={type} className={composedClassName} {...buttonProps}>
      {children}
    </button>
  );
};
