import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET /api/profile - Get current user's profile
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If profile doesn't exist, create it
    if (!user.profile) {
      const newProfile = await prisma.profile.create({
        data: {
          userId: user.id,
        },
      });
      user.profile = newProfile;
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      profile: user.profile,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      bio,
      phone,
      city,
      skillLevel,
      favoriteSports,
      image,
    } = body;

    // Validate skillLevel if provided
    if (skillLevel && !['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].includes(skillLevel)) {
      return NextResponse.json(
        { error: 'Invalid skill level' },
        { status: 400 }
      );
    }

    // Validate favoriteSports if provided
    const validSportTypes = [
      'FOOTBALL', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL', 'BADMINTON',
      'TABLE_TENNIS', 'RUNNING', 'CYCLING', 'SWIMMING', 'GYM', 'OTHER'
    ];
    if (favoriteSports && !Array.isArray(favoriteSports)) {
      return NextResponse.json(
        { error: 'Favorite sports must be an array' },
        { status: 400 }
      );
    }
    if (favoriteSports && !favoriteSports.every((sport: string) => validSportTypes.includes(sport))) {
      return NextResponse.json(
        { error: 'Invalid sport type' },
        { status: 400 }
      );
    }
    // Update user name and image if provided
    const updateUserData: any = {};
    if (name !== undefined) {
      updateUserData.name = name;
    }
    if (image !== undefined) {
      updateUserData.image = image;
    }

    if (Object.keys(updateUserData).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: updateUserData,
      });
    }

    // Update or create profile
    const updateProfileData: any = {};
    if (bio !== undefined) updateProfileData.bio = bio;
    if (phone !== undefined) updateProfileData.phone = phone;
    if (city !== undefined) updateProfileData.city = city;
    if (skillLevel !== undefined) updateProfileData.skillLevel = skillLevel;
    if (favoriteSports !== undefined) updateProfileData.favoriteSports = favoriteSports;

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: updateProfileData,
      create: {
        userId: session.user.id,
        ...updateProfileData,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
      },
    });

    return NextResponse.json({
      id: user!.id,
      name: user!.name,
      email: user!.email,
      image: user!.image,
      profile: user!.profile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
