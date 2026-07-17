import React from 'react';

export const JobCardSkeleton: React.FC = () => {
  return (
    <div className="glass-card p-5 rounded-2xl w-full space-y-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/5 rounded-xl shrink-0" />
        <div className="space-y-2 w-full">
          <div className="h-4 bg-white/5 rounded w-2/3" />
          <div className="h-3 bg-white/5 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-5/6" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-white/5 rounded-lg w-16" />
        <div className="h-6 bg-white/5 rounded-lg w-20" />
        <div className="h-6 bg-white/5 rounded-lg w-24" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-white/5">
        <div className="h-3 bg-white/5 rounded w-24" />
        <div className="h-8 bg-indigo-600/10 rounded-lg w-24" />
      </div>
    </div>
  );
};

export const DashboardMetricSkeleton: React.FC = () => {
  return (
    <div className="glass-card p-6 rounded-2xl animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-white/5 rounded w-24" />
        <div className="w-8 h-8 bg-white/5 rounded-lg" />
      </div>
      <div className="h-8 bg-white/5 rounded w-16" />
      <div className="h-3 bg-white/5 rounded w-32" />
    </div>
  );
};

export const BlogCardSkeleton: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-white/5 rounded w-16" />
        <div className="h-5 bg-white/5 rounded w-5/6" />
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
        <div className="flex items-center gap-2 pt-4 border-t border-white/5">
          <div className="w-8 h-8 bg-white/5 rounded-full" />
          <div className="h-3 bg-white/5 rounded w-20" />
        </div>
      </div>
    </div>
  );
};
