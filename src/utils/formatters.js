import { formatDistanceToNow, format } from 'date-fns';
import { REPORT_CATEGORIES, ADMIN_ROLES } from './constants';

export const formatCategory = (categoryValue) => {
  const found = REPORT_CATEGORIES.find(c => c.value === categoryValue);
  return found ? found.label : categoryValue?.replace(/_/g, ' ') || 'Unknown';
};

export const formatRole = (roleValue) => {
  return ADMIN_ROLES[roleValue] || roleValue?.replace(/_/g, ' ') || 'Unknown';
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Unknown date';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return 'Unknown date';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'Unknown';
  try {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
  } catch {
    return 'Unknown';
  }
};

export const formatStatus = (status) => {
  return status?.replace(/_/g, ' ') || 'Unknown';
};

export const getScoreColour = (score) => {
  if (score === null || score === undefined) return 'text-gray-400';
  if (score >= 65) return 'text-green-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

export const getScoreBarColour = (score) => {
  if (score === null || score === undefined) return 'bg-gray-300';
  if (score >= 65) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};
