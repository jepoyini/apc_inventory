
import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, User, Users } from 'lucide-react';

// Mock data structure for a matrix
type MatrixMember = {
  id: string;
  name: string;
  initials: string;
  level: number;
  hasChildren: boolean;
  position: number;
  parentId: string | null;
  image?: string;
};

// Generate mock data
const generateMockMatrix = (): MatrixMember[] => {
  const matrix: MatrixMember[] = [
    {
      id: 'user-0',
      name: 'You',
      initials: 'YO',
      level: 0,
      position: 0,
      parentId: null,
      hasChildren: true
    }
  ];

  // First level children (direct referrals)
  for (let i = 1; i <= 5; i++) {
    const hasChildren = i <= 3; // First 3 have children
    matrix.push({
      id: `user-${i}`,
      name: `Member ${i}`,
      initials: `M${i}`,
      level: 1,
      position: i,
      parentId: 'user-0',
      hasChildren
    });
  }

  // Second level - some children for the first level
  for (let i = 1; i <= 3; i++) {
    const parentId = `user-${i}`;
    for (let j = 1; j <= 3; j++) {
      const id = `user-${i}-${j}`;
      matrix.push({
        id,
        name: `Submember ${i}-${j}`,
        initials: `S${j}`,
        level: 2,
        position: j,
        parentId,
        hasChildren: false
      });
    }
  }

  return matrix;
};

const Genealogy = () => {
  const isMobile = useIsMobile();
  const [matrix, setMatrix] = useState<MatrixMember[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  
  useEffect(() => {
    setIsAnimatingIn(true);
    
    // Generate mock data
    const mockMatrix = generateMockMatrix();
    
    // Simulate loading for animation
    setTimeout(() => {
      setMatrix(mockMatrix);
      setIsAnimatingIn(false);
    }, 600);
  }, []);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 1.8));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.6));
  };

  // Helper to position nodes
  const getNodePosition = (member: MatrixMember) => {
    if (member.level === 0) {
      return { left: '50%', top: '0' };
    }
    
    if (member.level === 1) {
      const positions = [
        '10%',
        '30%',
        '50%',
        '70%',
        '90%'
      ];
      return { 
        left: positions[member.position - 1] || '50%', 
        top: '120px' 
      };
    }
    
    // Level 2 positioning
    if (member.level === 2) {
      const parentIndex = parseInt(member.parentId?.split('-')[1] || '0');
      const baseLeftPositions = [
        '10%', // parent 1
        '30%', // parent 2
        '50%'  // parent 3
      ];
      
      const leftOffset = member.position * 6;
      const baseLeft = baseLeftPositions[parentIndex - 1] || '50%';
      const left = `calc(${baseLeft} + ${leftOffset}%)`;
      
      return { left, top: '240px' };
    }
    
    return { left: '50%', top: '0' };
  };

  // Rendering functions
  const renderMatrixNode = (member: MatrixMember) => {
    const { left, top } = getNodePosition(member);
    
    return (
      <div 
        key={member.id}
        className="absolute matrix-node animate-scale-in"
        style={{ 
          left, 
          top, 
          transform: 'translate(-50%, 0)',
          zIndex: 10,
          transitionDelay: `${member.level * 0.1 + member.position * 0.05}s`
        }}
      >
        <div 
          className={`flex items-center justify-center w-full h-full rounded-full 
            ${member.level === 0 ? 'bg-primary text-primary-foreground' : 'bg-card'}
            transition-all duration-300 border`}
        >
          {member.initials}
        </div>
      </div>
    );
  };

  const renderMatrixLines = () => {
    return matrix.map(member => {
      if (!member.parentId) return null;
      
      const parent = matrix.find(m => m.id === member.parentId);
      if (!parent) return null;
      
      const parentPos = getNodePosition(parent);
      const childPos = getNodePosition(member);
      
      const startX = parseFloat(parentPos.left as string);
      const startY = parseFloat(parentPos.top as string) + 14; // Add half node height
      const endX = parseFloat(childPos.left as string);
      const endY = parseFloat(childPos.top as string);
      
      // Calculate line length and angle
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      
      return (
        <div 
          key={`line-${parent.id}-${member.id}`}
          className="matrix-line animate-fade-in"
          style={{
            left: `${startX}%`,
            top: `${startY}px`,
            width: `${length}px`,
            height: '1px',
            transformOrigin: '0 0',
            transform: `rotate(${angle}deg)`,
            transitionDelay: `${member.level * 0.1 + member.position * 0.05}s`
          }}
        />
      );
    });
  };

  return (
    <div className="animate-fade-in">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Matrix Structure</CardTitle>
              <CardDescription>
                Visualize your 1x5 matrix network
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleZoomOut} 
                disabled={zoomLevel <= 0.6}
              >
                <ZoomOut size={16} />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleZoomIn}
                disabled={zoomLevel >= 1.8}
              >
                <ZoomIn size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-auto h-[400px] p-4">
            <div 
              className="relative w-full h-full"
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
                transition: 'transform 0.3s ease-out'
              }}
            >
              {isAnimatingIn ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <>
                  {renderMatrixLines()}
                  {matrix.map(renderMatrixNode)}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <User className="mr-2 h-5 w-5 text-primary" />
              <CardTitle>Direct Referrals</CardTitle>
            </div>
            <CardDescription>
              Members you've personally referred
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">5/5</div>
            <div className="text-sm text-muted-foreground">
              Your first level is complete
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              <CardTitle>Total Network Size</CardTitle>
            </div>
            <CardDescription>
              All members in your matrix
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">14</div>
            <div className="text-sm text-muted-foreground">
              Across all levels
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Genealogy;
