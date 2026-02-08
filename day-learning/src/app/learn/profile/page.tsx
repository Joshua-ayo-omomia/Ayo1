'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { User, Github, Linkedin, Globe, Save, CheckCircle2 } from 'lucide-react'

interface Profile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  country: string | null
  linkedin_url: string | null
  github_url: string | null
  avatar_url: string | null
  bio: string | null
}

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data as Profile)
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    const { error } = await (supabase as any)
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        country: profile.country,
        linkedin_url: profile.linkedin_url,
        github_url: profile.github_url,
        bio: profile.bio,
      })
      .eq('id', profile.id)

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-navy-700 rounded w-48" />
            <div className="h-64 bg-navy-700 rounded" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-display font-bold text-warm-50 mb-6">
          Your Profile
        </h1>

        <form onSubmit={handleSave} className="space-y-6">
          <Card className="bg-navy-700 border-navy-600">
            <CardHeader>
              <CardTitle className="text-warm-50 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-500" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Avatar
                  name={profile?.full_name || 'U'}
                  size="lg"
                />
                <div>
                  <p className="text-warm-50 font-medium">{profile?.full_name}</p>
                  <p className="text-warm-400 text-sm">{profile?.email}</p>
                </div>
              </div>

              <Input
                label="Full Name"
                value={profile?.full_name || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                className="bg-navy-800 border-navy-600 text-warm-50"
              />

              <Input
                label="Phone"
                value={profile?.phone || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                className="bg-navy-800 border-navy-600 text-warm-50"
              />

              <Input
                label="Country"
                value={profile?.country || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, country: e.target.value } : null)}
                className="bg-navy-800 border-navy-600 text-warm-50"
              />
            </CardContent>
          </Card>

          <Card className="bg-navy-700 border-navy-600">
            <CardHeader>
              <CardTitle className="text-warm-50 flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-500" />
                Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="GitHub URL"
                value={profile?.github_url || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, github_url: e.target.value } : null)}
                placeholder="https://github.com/username"
                className="bg-navy-800 border-navy-600 text-warm-50"
              />

              <Input
                label="LinkedIn URL"
                value={profile?.linkedin_url || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, linkedin_url: e.target.value } : null)}
                placeholder="https://linkedin.com/in/username"
                className="bg-navy-800 border-navy-600 text-warm-50"
              />
            </CardContent>
          </Card>

          <Card className="bg-navy-700 border-navy-600">
            <CardHeader>
              <CardTitle className="text-warm-50">About You</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                label="Bio"
                value={profile?.bio || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                placeholder="Tell your cohort about yourself..."
                rows={4}
                className="bg-navy-800 border-navy-600 text-warm-50"
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving} className="w-full">
            {saved ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Saved!
              </span>
            ) : saving ? (
              'Saving...'
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Profile
              </span>
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  )
}
