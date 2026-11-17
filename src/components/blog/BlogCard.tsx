import React from 'react';
import { ArrowUpRight, Layers, Ruler, Sparkles, Tag, type LucideIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Link } from '../../utils/router';
import {
  blogPillarPath,
  blogPostPath,
  getPillarById,
  readingMinutes,
  type BlogPillar,
  type BlogPost,
  type PillarId,
} from '../../data/blog';

export const PILLAR_ICONS: Record<PillarId, LucideIcon> = {
  basics: Layers,
  fitment: Ruler,
  buying: Tag,
  care: Sparkles,
};

/** One article as a card. The whole card is clickable through the title's link (stretched with ::after). */
export const BlogCard: React.FC<{ post: BlogPost; className?: string }> = ({ post, className = '' }) => {
  const pillar = getPillarById(post.pillar);
  const Icon = PILLAR_ICONS[post.pillar];
  return (
    <Card className={`group relative h-full transition-colors hover:border-[#1D4ED8]/70 focus-within:border-[#1D4ED8]/70 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline">
            <Icon aria-hidden="true" className="h-3 w-3" />
            {pillar.name}
          </Badge>
          <span className="text-xs text-[#8E8E99]">{readingMinutes(post)} min read</span>
        </div>
        <CardTitle className="text-xl">
          <Link
            to={blogPostPath(post)}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-4 rounded-sm"
          >
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{post.excerpt}</CardDescription>
        <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-white">
          Read the guide
          <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-[#8E8E99] transition-colors group-hover:text-[#F43F5E]" />
        </p>
      </CardContent>
    </Card>
  );
};

/** A content pillar as a card: icon, name, summary and how many guides it holds. */
export const PillarCard: React.FC<{ pillar: BlogPillar; count: number }> = ({ pillar, count }) => {
  const Icon = PILLAR_ICONS[pillar.id];
  return (
    <Card className="group relative h-full transition-colors hover:border-[#1D4ED8]/70 focus-within:border-[#1D4ED8]/70">
      <CardHeader>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#1D4ED8]/15 text-[#BFD0FF]">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <CardTitle className="text-xl">
          <Link
            to={blogPillarPath(pillar)}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-4 rounded-sm"
          >
            {pillar.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{pillar.description}</CardDescription>
        <p className="mt-4 text-sm font-medium text-white">
          {count} {count === 1 ? 'guide' : 'guides'}
        </p>
      </CardContent>
    </Card>
  );
};
