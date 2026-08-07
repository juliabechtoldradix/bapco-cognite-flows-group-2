import { connectToHostApp as connectToHostAppImpl } from '@cognite/app-sdk';
import type { HostAppAPI } from '@cognite/app-sdk';
import { CogniteSdkProvider } from '@cognite/app-sdk/react';
import { Alert, AlertDescription } from '@cognite/aura/components/alert';
import { Card, CardContent } from '@cognite/aura/components/card';
import { Loader } from '@cognite/aura/components/loader';
import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';

import type { ChecklistService } from './checklist/contracts';
import { ChecklistPage } from './checklist/shell/ChecklistPage';

type AppApi = Pick<HostAppAPI, 'syncInternalState'>;
type AppConnectResult = { api: AppApi; initialState?: string };

const loadingFallback = (
  <main className="min-h-screen bg-background text-foreground">
    <section className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center p-4 sm:p-8">
      <div className="mx-auto w-full max-w-sm">
        <Card aria-label="Loading project" aria-live="polite">
          <CardContent>
            <div className="inline-flex items-center gap-3 text-muted-foreground">
              <Loader size={20} />
              <span>Loading project...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  </main>
);

const errorFallback = (
  <main className="min-h-screen bg-background text-foreground">
    <section className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center p-4 sm:p-8">
      <div className="mx-auto w-full max-w-sm">
        <Alert variant="error">
          <AlertDescription>Failed to connect to Fusion host</AlertDescription>
        </Alert>
      </div>
    </section>
  </main>
);

type AppContentProps = {
  api: AppApi | null;
  initialState?: string;
  checklistService?: ChecklistService;
};

function AppContent({ api, initialState, checklistService }: AppContentProps) {
  return (
    <ChecklistPage api={api} initialState={initialState} checklistService={checklistService} />
  );
}

type AppProps = {
  deps?: ComponentProps<typeof CogniteSdkProvider>['deps'];
  connectToHostApp?: () => Promise<AppConnectResult>;
  /** Test override. Production omits this and uses CdfChecklistService. */
  checklistService?: ChecklistService;
};

function App({
  deps,
  connectToHostApp = deps?.connectToHostApp ?? connectToHostAppImpl,
  checklistService,
}: AppProps) {
  const [connection, setConnection] = useState<AppConnectResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    void connectToHostApp().then((result) => {
      if (!cancelled) setConnection(result);
    });
    return () => {
      cancelled = true;
    };
  }, [connectToHostApp]);

  return (
    <CogniteSdkProvider loadingFallback={loadingFallback} errorFallback={errorFallback} deps={deps}>
      <AppContent
        api={connection?.api ?? null}
        initialState={connection?.initialState}
        checklistService={checklistService}
      />
    </CogniteSdkProvider>
  );
}

export default App;
