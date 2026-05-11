<?php

namespace App\Console\Commands;

use App\Models\Disease;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

#[Signature('sitemap:generate')]
#[Description('Generate sitemap.xml for SEO')]
class GenerateSitemap extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Generating sitemap...');

        $appUrl = config('app.url', 'https://mapan.test');
        $sitemap = Sitemap::create();

        // Priority diseases (Blast, Brown Spot, Tungro)
        $priorityDiseases = ['blast', 'brown-spot', 'tungro'];

        // Homepage
        $sitemap->add(
            Url::create('/')
                ->setLastModificationDate(now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                ->setPriority(1.0)
        );

        // Diseases list page
        $sitemap->add(
            Url::create('/diseases')
                ->setLastModificationDate(now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                ->setPriority(0.9)
        );

        // Expert system page
        $sitemap->add(
            Url::create('/expert-system')
                ->setLastModificationDate(now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                ->setPriority(0.8)
        );

        // Detection page
        $sitemap->add(
            Url::create('/detection')
                ->setLastModificationDate(now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                ->setPriority(0.8)
        );

        // Individual disease pages
        $diseases = Disease::where('slug', '!=', 'healthy')->get();

        foreach ($diseases as $disease) {
            $priority = in_array($disease->slug, $priorityDiseases) ? 0.9 : 0.8;

            $sitemap->add(
                Url::create("/diseases/{$disease->slug}")
                    ->setLastModificationDate($disease->updated_at)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                    ->setPriority($priority)
            );
        }

        // Write sitemap to public directory
        $sitemap->writeToFile(public_path('sitemap.xml'));

        $totalUrls = count($sitemap->getTags());
        $this->info('✓ Sitemap generated successfully at public/sitemap.xml');
        $this->info("✓ Total URLs: {$totalUrls}");

        return Command::SUCCESS;
    }
}
