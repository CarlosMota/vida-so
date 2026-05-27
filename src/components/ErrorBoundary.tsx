import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Erro na aplicação:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold mb-2">Algo saiu do esperado</h1>
            <p className="text-muted-foreground">
              Recarregue a página para tentar novamente.
            </p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
