export function Footer() {
  return (
    <footer className="py-8 text-center text-sm text-muted-foreground" data-testid="footer">
      Made with ❤ by{' '}
      <a
        href="https://devan.gg"
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground hover:text-primary transition-colors underline underline-offset-2"
      >
        dev
      </a>
    </footer>
  );
}
