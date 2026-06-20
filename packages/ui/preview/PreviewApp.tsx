import { ArcadeButton } from '../src/components/ArcadeButton';
import { ArcadePanel } from '../src/components/ArcadePanel';
import { PixelBadge } from '../src/components/PixelBadge';
import { XpBar } from '../src/components/XpBar';

export function PreviewApp() {
  return (
    <div className="min-h-screen bg-arcade-background p-8 font-body text-arcade-text-primary scanline">
      <h1 className="mb-8 font-pixel text-sm text-arcade-primary">Wave Arcade UI</h1>
      <ArcadePanel className="mb-6 max-w-md space-y-4">
        <div className="flex gap-2">
          <PixelBadge variant="faction">Xaman Knights</PixelBadge>
          <PixelBadge variant="quest">Quest Active</PixelBadge>
          <PixelBadge variant="wallet">Connected</PixelBadge>
        </div>
        <XpBar totalXp={650} currentLevelXp={50} nextLevelXp={400} level={3} />
        <ArcadeButton>Start Quest</ArcadeButton>
        <ArcadeButton loading>Loading</ArcadeButton>
      </ArcadePanel>
    </div>
  );
}
