import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Lock, CheckCircle2 } from 'lucide-react';

import { Navbar } from './components/Navbar';
import { TornPaperCollage } from './components/TornPaperCollage';
import { PlanningBar } from './components/PlanningBar';
import { ChatPanel } from './components/ChatPanel';
import { TimelinePanel } from './components/TimelinePanel';
import { MapPanel } from './components/MapPanel';
import { FoodModal } from './components/FoodModal';
import { ChecklistView } from './components/ChecklistView';
import { AdminView } from './components/AdminView';
import { FeatureShowcase } from './components/FeatureShowcase';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

import { Stop, ChatMessage, ProposalOption, Destination } from './types';
import {
  INITIAL_STOPS,
  ALL_DAY_1_STOPS,
  INITIAL_REVEALED_STOPS,
  ALL_DAY_2_STOPS,
  INITIAL_DAY_2_REVEALED_STOPS,
  ALL_DAY_3_STOPS,
  INITIAL_DAY_3_REVEALED_STOPS,
  VIETNAM_COLLAGE_DESTINATIONS,
  PROPOSALS,
  INITIAL_CHAT_MESSAGES,
  DEMO_SCENARIO_STEPS,
  ScriptStep
} from './data/mockData';
import worldMapBg from './assets/images/world-map-collage.jpg';

export function App() {
  const [currentTab, setCurrentTab] = useState<'landing' | 'room' | 'checklist' | 'admin'>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Multi-stage plan lifecycle: empty -> proposals -> detailed -> finalized
  const [planStage, setPlanStage] = useState<'empty' | 'proposals' | 'detailed' | 'finalized'>('empty');
  const [selectedProposalKey, setSelectedProposalKey] = useState<string>('A');
  const [proposals, setProposals] = useState<ProposalOption[]>(PROPOSALS);
  const [activeDayTab, setActiveDayTab] = useState<'overview' | 'day1' | 'day2' | 'day3'>('overview');

  // Stops state for each day: initially empty until group locks overall proposal!
  const [day1Stops, setDay1Stops] = useState<Stop[]>([]);
  const [day2Stops, setDay2Stops] = useState<Stop[]>([]);
  const [day3Stops, setDay3Stops] = useState<Stop[]>([]);

  // Current display stops based on active day tab
  const stops = activeDayTab === 'day2' ? day2Stops : activeDayTab === 'day3' ? day3Stops : day1Stops;

  const [activeStopId, setActiveStopId] = useState<string>('stop-airport');
  const [isFinalLocked, setIsFinalLocked] = useState<boolean>(false);
  const [selectedFoodStop, setSelectedFoodStop] = useState<Stop | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Chat & Scenario Script States
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [inputMsg, setInputMsg] = useState<string>('');
  const [isConciergeTyping, setIsConciergeTyping] = useState<boolean>(false);
  const [scriptStepIndex, setScriptStepIndex] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Helper to send concierge reply
  const sendConciergeReply = (text: string, delay = 800) => {
    setIsConciergeTyping(true);
    setTimeout(() => {
      setIsConciergeTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'concierge',
          name: 'Cố Vấn Bản Địa',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text
        }
      ]);
    }, delay);
  };

  // Execute Auto-Swap based on group consensus (no manual button)
  const executeAutoSwap = (stopId: string) => {
    let targetNewName = '';

    const swapUpdater = (prev: Stop[]) => prev.map(s => {
      if (s.id === stopId && s.backupOption) {
        const oldName = s.name;
        targetNewName = s.backupOption.name;
        
        // Sync candidates if stop has candidates
        let updatedCandidates = s.candidates;
        let selectedCandId = s.selectedCandidateId;
        if (s.candidates) {
          const backupCand = s.candidates.find(c => c.name.includes(targetNewName) || c.id === 'cand-cafe-2');
          if (backupCand) {
            selectedCandId = backupCand.id;
            updatedCandidates = s.candidates.map(c =>
              c.id === backupCand.id
                ? { ...c, votes: ['Hoàng Anh', 'Lan Vy', 'Minh Đức (Bạn)'] }
                : { ...c, votes: [] }
            );
          }
        }

        return {
          ...s,
          name: s.backupOption.name,
          address: s.backupOption.address,
          lat: s.backupOption.lat,
          lng: s.backupOption.lng,
          desc: `Phương án thay thế theo đồng thuận nhóm: ${s.backupOption.reason}`,
          isSwapped: true,
          votesUp: 3,
          votesDown: 0,
          selectedCandidateId: selectedCandId,
          candidates: updatedCandidates,
          backupOption: {
            name: oldName,
            address: s.address,
            reason: 'Quay lại phương án gốc ban đầu',
            lat: s.lat,
            lng: s.lng
          }
        };
      }
      return s;
    });

    if (stopId.startsWith('stop-d2-')) {
      setDay2Stops(swapUpdater);
    } else if (stopId.startsWith('stop-d3-')) {
      setDay3Stops(swapUpdater);
    } else {
      setDay1Stops(swapUpdater);
    }

    if (targetNewName) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: 'concierge',
            name: 'Hệ Thống',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `🎉 Đạt đồng thuận 3/3 thành viên: Đã tự động hoán đổi sang ${targetNewName}!`,
            isSystemEvent: true
          }
        ]);
      }, 400);

      triggerToast(`Đã tự động hoán đổi sang "${targetNewName}" theo biểu quyết của nhóm!`);
    }
  };

  // Vote on Stop (Consensus Logic: 3 votes down triggers auto-swap)
  const handleVote = (stopId: string, type: 'up' | 'down' | 'heart') => {
    if (isFinalLocked) {
      triggerToast('Lịch trình đã chốt chính thức, không thể thay đổi phiếu!');
      return;
    }

    const updater = (prev: Stop[]) => prev.map(s => {
      if (s.id === stopId) {
        if (type === 'heart') return { ...s, hearts: s.hearts + 1 };
        if (type === 'up') return { ...s, votesUp: s.votesUp + 1, votesDown: Math.max(0, s.votesDown - 1) };
        if (type === 'down') {
          const newDown = s.votesDown + 1;
          if (newDown >= 3 && s.backupOption && !s.isSwapped) {
            setTimeout(() => executeAutoSwap(s.id), 200);
          }
          return { ...s, votesDown: newDown, votesUp: Math.max(0, s.votesUp - 1) };
        }
      }
      return s;
    });

    if (stopId.startsWith('stop-d2-')) {
      setDay2Stops(updater);
    } else if (stopId.startsWith('stop-d3-')) {
      setDay3Stops(updater);
    } else {
      setDay1Stops(updater);
    }

    triggerToast(type === 'heart' ? 'Đã thả tim điểm dừng!' : 'Đã ghi nhận phiếu biểu quyết của bạn!');
  };

  // Democratic voting on Macro Proposals
  const handleVoteProposal = (key: string) => {
    setProposals(prev => prev.map(p => {
      const isTarget = p.key === key;
      const currentVotes = p.votes || [];
      const hasVoted = currentVotes.includes('Minh Đức (Bạn)');

      if (isTarget) {
        if (hasVoted) {
          return { ...p, votes: currentVotes.filter(v => v !== 'Minh Đức (Bạn)') };
        } else {
          return { ...p, votes: [...currentVotes, 'Minh Đức (Bạn)'] };
        }
      } else {
        return { ...p, votes: currentVotes.filter(v => v !== 'Minh Đức (Bạn)') };
      }
    }));

    setSelectedProposalKey(key);
    triggerToast(`Đã ghi nhận phiếu biểu quyết của bạn cho Phương Án ${key}!`);
  };

  // Helper to vote candidate in a stop array and handle progressive 1-by-1 unlocking
  const voteCandidateInList = (
    prevStops: Stop[],
    stopId: string,
    candidateId: string,
    allDayStops: Stop[],
    dayNumber: 1 | 2 | 3
  ): Stop[] => {
    let shouldConfirm = false;

    const updatedStops = prevStops.map(s => {
      if (s.id === stopId && s.candidates) {
        let winningCandidate = s.candidates[0];
        let maxVotes = -1;
        const updatedCandidates = s.candidates.map(cand => {
          const currentVotes = cand.votes || [];
          const hasVoted = currentVotes.includes('Minh Đức (Bạn)');
          let nextVotes: string[];
          if (cand.id === candidateId) {
            nextVotes = hasVoted
              ? currentVotes.filter(v => v !== 'Minh Đức (Bạn)')
              : [...currentVotes, 'Minh Đức (Bạn)'];
          } else {
            nextVotes = currentVotes.filter(v => v !== 'Minh Đức (Bạn)');
          }
          if (nextVotes.length > maxVotes) {
            maxVotes = nextVotes.length;
            winningCandidate = { ...cand, votes: nextVotes };
          }
          return { ...cand, votes: nextVotes };
        });

        const isConsensus = winningCandidate.votes.length >= 2;
        if (isConsensus) shouldConfirm = true;

        return {
          ...s,
          name: isConsensus ? winningCandidate.name : s.name,
          address: winningCandidate.address,
          cost: winningCandidate.cost,
          desc: winningCandidate.desc,
          lat: winningCandidate.lat,
          lng: winningCandidate.lng,
          dishes: winningCandidate.dishes || s.dishes,
          selectedCandidateId: winningCandidate.id,
          isSlotConfirmed: isConsensus ? true : s.isSlotConfirmed,
          candidates: updatedCandidates,
          votesUp: Math.max(1, winningCandidate.votes.length),
          matchedDesire: winningCandidate.matchedDesire || s.matchedDesire
        };
      }
      return s;
    });

    if (!shouldConfirm) return updatedStops;

    // Progressive 1-by-1 unlock based on which day and which stop
    let nextResult = updatedStops;

    if (dayNumber === 1) {
      if (stopId === 'stop-hotel' && nextResult.length === 2) {
        nextResult = [...nextResult, { ...allDayStops[2], isSlotConfirmed: false }];
      } else if (stopId === 'stop-1' && nextResult.length === 3) {
        nextResult = [
          ...nextResult,
          {
            ...allDayStops[3],
            name: 'Quán Cafe Sáng — [Đang Mở Bình Chọn Rooftop vs Nhà Cổ]',
            isSlotConfirmed: false,
            selectedCandidateId: undefined,
            candidates: allDayStops[3].candidates?.map(c =>
              c.id === 'cand-cafe-1' ? { ...c, votes: ['Lan Vy'] } : { ...c, votes: [] }
            )
          }
        ];
      } else if (stopId === 'stop-2' && nextResult.length === 4) {
        nextResult = [
          ...nextResult,
          {
            ...allDayStops[4],
            name: 'Quán Ăn Trưa — [Đang Tư Vấn Chay & Mở Bình Chọn]',
            isSlotConfirmed: false,
            selectedCandidateId: undefined,
            candidates: allDayStops[4].candidates?.map(c =>
              c.id === 'cand-lunch-1' ? { ...c, votes: ['Lan Vy'] } : { ...c, votes: [] }
            )
          },
          { ...allDayStops[5], isSlotConfirmed: true }
        ];
      } else if (stopId === 'stop-3' && nextResult.length === 6) {
        nextResult = [
          ...nextResult,
          { ...allDayStops[6], isSlotConfirmed: false },
          { ...allDayStops[7], isSlotConfirmed: false }
        ];
      }
    } else if (dayNumber === 2) {
      if (stopId === 'stop-d2-1' && nextResult.length === 1) {
        nextResult = [...nextResult, { ...allDayStops[1], isSlotConfirmed: false }];
      } else if (stopId === 'stop-d2-2' && nextResult.length === 2) {
        nextResult = [...nextResult, { ...allDayStops[2], isSlotConfirmed: false }];
      } else if (stopId === 'stop-d2-3' && nextResult.length === 3) {
        nextResult = [
          ...nextResult,
          { ...allDayStops[3], isSlotConfirmed: true },
          { ...allDayStops[4], isSlotConfirmed: false }
        ];
      } else if (stopId === 'stop-d2-5' && nextResult.length === 5) {
        nextResult = [...nextResult, { ...allDayStops[5], isSlotConfirmed: false }];
      }
    } else if (dayNumber === 3) {
      if (stopId === 'stop-d3-1' && nextResult.length === 1) {
        nextResult = [...nextResult, { ...allDayStops[1], isSlotConfirmed: false }];
      } else if (stopId === 'stop-d3-2' && nextResult.length === 2) {
        nextResult = [...nextResult, { ...allDayStops[2], isSlotConfirmed: false }];
      } else if (stopId === 'stop-d3-3' && nextResult.length === 3) {
        nextResult = [...nextResult, { ...allDayStops[3], isSlotConfirmed: false }];
      }
    }

    return nextResult;
  };

  // Direct manual stop confirmation helper
  const confirmStopInList = (
    prevStops: Stop[],
    stopId: string,
    allDayStops: Stop[],
    dayNumber: 1 | 2 | 3
  ): Stop[] => {
    const updated = prevStops.map(s => (s.id === stopId ? { ...s, isSlotConfirmed: true } : s));

    if (dayNumber === 1) {
      if (stopId === 'stop-hotel' && updated.length === 2) {
        return [...updated, { ...allDayStops[2], isSlotConfirmed: false }];
      }
      if (stopId === 'stop-1' && updated.length === 3) {
        return [
          ...updated,
          {
            ...allDayStops[3],
            name: 'Quán Cafe Sáng — [Đang Mở Bình Chọn Rooftop vs Nhà Cổ]',
            isSlotConfirmed: false,
            selectedCandidateId: undefined,
            candidates: allDayStops[3].candidates?.map(c =>
              c.id === 'cand-cafe-1' ? { ...c, votes: ['Lan Vy'] } : { ...c, votes: [] }
            )
          }
        ];
      }
      if (stopId === 'stop-2' && updated.length === 4) {
        return [
          ...updated,
          {
            ...allDayStops[4],
            name: 'Quán Ăn Trưa — [Đang Tư Vấn Chay & Mở Bình Chọn]',
            isSlotConfirmed: false,
            selectedCandidateId: undefined,
            candidates: allDayStops[4].candidates?.map(c =>
              c.id === 'cand-lunch-1' ? { ...c, votes: ['Lan Vy'] } : { ...c, votes: [] }
            )
          },
          { ...allDayStops[5], isSlotConfirmed: true }
        ];
      }
      if (stopId === 'stop-3' && updated.length === 6) {
        return [
          ...updated,
          { ...allDayStops[6], isSlotConfirmed: false },
          { ...allDayStops[7], isSlotConfirmed: false }
        ];
      }
    } else if (dayNumber === 2) {
      if (stopId === 'stop-d2-1' && updated.length === 1) {
        return [...updated, { ...allDayStops[1], isSlotConfirmed: false }];
      }
      if (stopId === 'stop-d2-2' && updated.length === 2) {
        return [...updated, { ...allDayStops[2], isSlotConfirmed: false }];
      }
      if (stopId === 'stop-d2-3' && updated.length === 3) {
        return [
          ...updated,
          { ...allDayStops[3], isSlotConfirmed: true },
          { ...allDayStops[4], isSlotConfirmed: false }
        ];
      }
      if (stopId === 'stop-d2-5' && updated.length === 5) {
        return [...updated, { ...allDayStops[5], isSlotConfirmed: false }];
      }
    } else if (dayNumber === 3) {
      if (stopId === 'stop-d3-1' && updated.length === 1) {
        return [...updated, { ...allDayStops[1], isSlotConfirmed: false }];
      }
      if (stopId === 'stop-d3-2' && updated.length === 2) {
        return [...updated, { ...allDayStops[2], isSlotConfirmed: false }];
      }
      if (stopId === 'stop-d3-3' && updated.length === 3) {
        return [...updated, { ...allDayStops[3], isSlotConfirmed: false }];
      }
    }

    return updated;
  };

  // Candidate venue voting for each stop slot (With Progressive Unlock)
  const handleVoteCandidate = (stopId: string, candidateId: string) => {
    if (stopId.startsWith('stop-d2-')) {
      setDay2Stops(prev => voteCandidateInList(prev, stopId, candidateId, ALL_DAY_2_STOPS, 2));
    } else if (stopId.startsWith('stop-d3-')) {
      setDay3Stops(prev => voteCandidateInList(prev, stopId, candidateId, ALL_DAY_3_STOPS, 3));
    } else {
      setDay1Stops(prev => voteCandidateInList(prev, stopId, candidateId, ALL_DAY_1_STOPS, 1));
    }
    triggerToast('Đã ghi nhận phiếu bình chọn địa điểm của bạn!');
  };

  // Direct manual stop confirmation handler
  const handleConfirmStop = (stopId: string) => {
    if (stopId.startsWith('stop-d2-')) {
      setDay2Stops(prev => confirmStopInList(prev, stopId, ALL_DAY_2_STOPS, 2));
    } else if (stopId.startsWith('stop-d3-')) {
      setDay3Stops(prev => confirmStopInList(prev, stopId, ALL_DAY_3_STOPS, 3));
    } else {
      setDay1Stops(prev => confirmStopInList(prev, stopId, ALL_DAY_1_STOPS, 1));
    }
    triggerToast('Đã chốt trạm dừng và mở khóa trạm tiếp theo!');
  };

  // Host Locks Macro Plan (Consensus Checkpoint 1) -> OPENS OVERVIEW DASHBOARD FIRST!
  const handleConfirmProposal = (prop: ProposalOption) => {
    // START WITH INITIAL REVEALED STOPS ONLY FOR EACH DAY
    setDay1Stops(INITIAL_REVEALED_STOPS);
    setDay2Stops(INITIAL_DAY_2_REVEALED_STOPS);
    setDay3Stops(INITIAL_DAY_3_REVEALED_STOPS);
    setActiveStopId('stop-airport');
    setPlanStage('detailed');
    setActiveDayTab('overview'); // MỞ MÀN HÌNH TỔNG QUAN 3N2Đ ĐẦU TIÊN
    setActiveStopId('stop-airport');
    setPlanStage('detailed');
    setActiveDayTab('overview'); // MỞ MÀN HÌNH TỔNG QUAN 3N2Đ ĐẦU TIÊN
    setScriptStepIndex(3);
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'concierge',
        name: 'Hệ Thống',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🎉 HOST ĐÃ KHÓA LỘ TRÌNH VĨ MÔ (Consensus Checkpoint 1: ${prop.title.toUpperCase()})! Hệ thống đã hiển thị Bảng Tổng Quan Kế Hoạch 3N2Đ. Cả nhóm cùng xem toàn cảnh trước khi bấm vào tab Ngày 1 để biểu quyết từng trạm dừng chi tiết. Các trạm tiếp theo sẽ tự động xuất hiện lần lượt sau khi nhóm chốt từng trạm!`,
        isSystemEvent: true
      }
    ]);
    triggerToast(`Đã khóa lộ trình vĩ mô: ${prop.title}! Mở bảng Tổng Quan 3N2Đ.`);
  };

  // Execute Step in the Guided Script Journey (Matching Two-Phase Architecture)
  const executeScenarioStep = (stepNum: number) => {
    if (stepNum === 1) {
      // Step 1: User invokes @agent with general desires & budget
      const userMsg: ChatMessage = {
        id: Date.now(),
        sender: 'user',
        name: 'Minh Đức (Bạn)',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: '@agent Nhóm mình 3 người đi Đà Nẵng - Hội An 3N2Đ, ngân sách 3.5tr/người. Lan Vy thích cafe view đẹp & hoàng hôn biển; Hoàng Anh ăn chay trường & cần nghỉ trưa tránh nắng; mình cần xe đón sân bay & khách sạn tiện đi lại. Hãy tính toán đề xuất các phương án tổng thể phù hợp nhất cho nhóm!'
      };
      setMessages(prev => [...prev, userMsg]);
      setIsConciergeTyping(true);

      setTimeout(() => {
        setIsConciergeTyping(false);
        const agentReply: ChatMessage = {
          id: Date.now() + 1,
          sender: 'concierge',
          name: 'Cố Vấn Bản Địa',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Chào Minh Đức và cả nhóm! Mình đã tiếp nhận và phân tích bộ thông số tổng quan của nhóm:\n• Điểm đến & Thời gian: Đà Nẵng — Phố Cổ Hội An (3 Ngày 2 Đêm)\n• Ngân sách mục tiêu: 3.500.000đ / người\n• Ràng buộc nhóm: Thực đơn có món chay chuẩn vị (Hoàng Anh), nghỉ trưa phòng lạnh 12h30-14h30 tránh say nắng, xe đón sân bay DAD & khách sạn tiện đi bộ.\n\nDựa trên nhu cầu đó, mình đề xuất 3 Phương Án Tổng Thể dưới đây với các định hướng trải nghiệm khác nhau. Cả nhóm cùng biểu quyết chọn phương án phù hợp nhất nhé!',
          filterValidation: {
            location: 'Đà Nẵng — Phố Cổ Hội An',
            duration: '3 Ngày 2 Đêm (Cuối tuần)',
            budget: '3.500.000đ / người',
            constraints: ['Hoàng Anh ăn chay trường', 'Nghỉ trưa tránh nắng 12h30-14h30', 'Xe đón từ sân bay DAD']
          },
          options: proposals
        };
        setMessages(prev => [...prev, agentReply]);

        // Lan Vy & Hoàng Anh react enthusiastically in group chat
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 2,
              sender: 'friend',
              name: 'Lan Vy',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: 'Oa @agent lên 3 phương án nhanh xỉu! Em thấy Phương Án A (Phố Cổ & Di Sản Ẩm Thực) chuẩn gu em nhất nè, có cafe rooftop ngắm ngói âm dương với hoàng hôn biển An Bàng nữa!'
            }
          ]);

          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + 3,
                sender: 'friend',
                name: 'Hoàng Anh',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: 'Công nhận, Phương án A cự ly di chuyển toàn chặng dưới 2.5km Haversine rất đỡ mệt, lại có món chay nấm Trà Quế nữa. Mình vote Phương Án A nha!'
              }
            ]);
          }, 450);
        }, 400);

        // Transition to Stage 1: Overall Proposals Voting!
        setPlanStage('proposals');
        setSelectedProposalKey('A');
        setScriptStepIndex(2);
        triggerToast('✅ Đã kích hoạt Giai Đoạn 1: Biểu Quyết Phương Án Tổng Thể!');
      }, 950);
    } else if (stepNum === 2) {
      // Step 2: Democratic Vote & Host locks Macro Plan -> OPENS OVERVIEW FIRST!
      setProposals(prev => prev.map(p =>
        p.key === 'A'
          ? { ...p, votes: ['Hoàng Anh', 'Lan Vy', 'Minh Đức (Bạn)'] }
          : { ...p, votes: (p.votes || []).filter(v => v !== 'Minh Đức (Bạn)') }
      ));

      const userMsg: ChatMessage = {
        id: Date.now(),
        sender: 'user',
        name: 'Minh Đức (Bạn)',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: '@agent Cả nhóm đã thảo luận và bỏ phiếu đạt 100% đồng thuận (3/3 thành viên) cho Phương Án A (Phố Cổ & Di Sản Ẩm Thực). Host tiến hành Khóa Lộ Trình Vĩ Mô và mở bảng Tổng Quan 3N2Đ nhé!'
      };
      setMessages(prev => [...prev, userMsg]);
      setIsConciergeTyping(true);

      setTimeout(() => {
        setIsConciergeTyping(false);
        const agentReply: ChatMessage = {
          id: Date.now() + 1,
          sender: 'concierge',
          name: 'Cố Vấn Bản Địa',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: '🎉 TUYỆT VỜI! Cả nhóm đã đồng thuận 100% (3/3 phiếu). Host (Minh Đức) đã Khóa Lộ Trình Vĩ Mô (Consensus Checkpoint 1: PHƯƠNG ÁN A)! Hệ thống đã mở Bảng Tổng Quan Kế Hoạch 3N2Đ toàn cảnh. Mời cả nhóm xem lướt khung chương trình rồi bấm vào từng ngày để biểu quyết chi tiết từng trạm dừng!'
        };
        setMessages(prev => [...prev, agentReply]);

        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 2,
              sender: 'friend',
              name: 'Lan Vy',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: 'Yayyy chốt Phương Án A rồi! Bấm vào xem Ngày 1 chi tiết đi anh Đức ơi, xem khách sạn mình ở đâu nè! 🥳'
            }
          ]);
        }, 400);

        // START WITH ONLY INITIAL REVEALED STOPS FOR ALL 3 DAYS
        setDay1Stops(INITIAL_REVEALED_STOPS);
        setDay2Stops(INITIAL_DAY_2_REVEALED_STOPS);
        setDay3Stops(INITIAL_DAY_3_REVEALED_STOPS);
        setActiveStopId('stop-airport');
        setPlanStage('detailed');
        setActiveDayTab('overview'); // MỞ TỔNG QUAN TRƯỚC!
        setScriptStepIndex(3);
        triggerToast('✅ Đã khóa lộ trình vĩ mô & mở bảng Tổng Quan 3N2Đ!');
      }, 900);
    } else if (stepNum === 3) {
      // Step 3: Vote Hotel Slot (Ở Khách Sạn Nào?)
      setActiveDayTab('day1');
      setActiveStopId('stop-hotel');

      const friendPromptMsg: ChatMessage = {
        id: Date.now(),
        sender: 'friend',
        name: 'Lan Vy',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Mọi người ơi, em thấy khách sạn Anio Boutique xinh xắn kiểu Indochine cổ điển, hồ bơi nhìn chill phết! La Siesta thì đắt hơn tận 400k/đêm lận á, vượt ngân sách của anh Đức mất!'
      };
      setMessages(prev => [...prev, friendPromptMsg]);

      setTimeout(() => {
        const userMsg: ChatMessage = {
          id: Date.now() + 1,
          sender: 'user',
          name: 'Minh Đức (Bạn)',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: '@agent Về chỗ ở: Nhóm mình biểu quyết chốt Anio Boutique Hotel (2/3 phiếu). Chốt xong trạm khách sạn để mở khóa trạm tiếp theo nhé!'
        };
        setMessages(prev => [...prev, userMsg]);
        setIsConciergeTyping(true);

        setTimeout(() => {
          setIsConciergeTyping(false);
          const agentReply: ChatMessage = {
            id: Date.now() + 2,
            sender: 'concierge',
            name: 'Cố Vấn Bản Địa',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: 'Đã ghi nhận kết quả biểu quyết trạm Khách Sạn Lưu Trú:\n• Anio Boutique Hotel Hội An: 2/3 phiếu (Minh Đức, Lan Vy) — ĐẮC CỬ (1.450.000đ/phòng/đêm, kiến trúc Đông Dương, cự ly 1.2km phố cổ).\n• La Siesta Hoi An: 1/3 phiếu (Hoàng Anh) — lưu làm điểm dự phòng.\n\n🔓 ĐÃ CHỐT TRẠM KHÁCH SẠN VÀ MỞ KHÓA DUY NHẤT TRẠM TIẾP THEO: Trạm 3 — Điểm Tâm Sáng (Bánh Mì Phượng & Nước Mót)! Mời cả nhóm kiểm tra điểm tâm sáng nhé!'
          };
          setMessages(prev => [...prev, agentReply]);

          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + 3,
                sender: 'friend',
                name: 'Hoàng Anh',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: 'Oke duyệt Anio nha, 1.45tr/phòng chia 3 người là chỉ tầm 480k/người/đêm quá êm ví! Giờ sang săn đồ ăn sáng đi mọi người ơi, đói bụng rồi 🤤'
              }
            ]);
          }, 450);

          setDay1Stops(prev => {
            const updatedHotel = prev.map(s => {
              if (s.id === 'stop-hotel' && s.candidates) {
                return {
                  ...s,
                  name: 'Anio Boutique Hotel Hội An — Check-in & Gửi Đồ',
                  votesUp: 2,
                  isSlotConfirmed: true,
                  selectedCandidateId: 'cand-hotel-1',
                  candidates: s.candidates.map(c => {
                    if (c.id === 'cand-hotel-1') return { ...c, votes: ['Lan Vy', 'Minh Đức (Bạn)'] };
                    if (c.id === 'cand-hotel-2') return { ...c, votes: ['Hoàng Anh'] };
                    return { ...c, votes: [] };
                  })
                };
              }
              return s;
            });

            return [
              ...updatedHotel,
              {
                ...ALL_DAY_1_STOPS[2], // stop-1 (Bánh Mì Phượng)
                isSlotConfirmed: false
              }
            ];
          });

          setActiveStopId('stop-1');
          setScriptStepIndex(4);
          triggerToast('Đã chốt trạm Khách Sạn & Mở khóa trạm Điểm tâm sáng!');
        }, 850);
      }, 400);
    } else if (stepNum === 4) {
      // Step 4: Vote Breakfast Slot -> Unlock Cafe Slot
      setActiveStopId('stop-1');

      const friendPromptMsg: ChatMessage = {
        id: Date.now(),
        sender: 'friend',
        name: 'Hoàng Anh',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Quán Bánh Mì Phượng có bánh mì pate nấm chay Trà Quế nướng giòn rụm với ly nước Mót hoa sen thanh mát kìa! Đúng món chay mình thích rồi, duyệt 100%!'
      };
      setMessages(prev => [...prev, friendPromptMsg]);

      setTimeout(() => {
        const userMsg: ChatMessage = {
          id: Date.now() + 1,
          sender: 'user',
          name: 'Minh Đức (Bạn)',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: '@agent Điểm tâm sáng nhóm vote chốt Bánh Mì Phượng (có bánh mì chay nấm cho Hoàng Anh). Chốt trạm 3 và mở khóa trạm Cafe sáng giúp nhóm nhé!'
        };
        setMessages(prev => [...prev, userMsg]);
        setIsConciergeTyping(true);

        setTimeout(() => {
          setIsConciergeTyping(false);
          const agentReply: ChatMessage = {
            id: Date.now() + 2,
            sender: 'concierge',
            name: 'Cố Vấn Bản Địa',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: 'Đã chốt trạm Điểm Tâm Sáng: Bánh Mì Phượng & Nước Mót (đã đối soát thực đơn có nhân nấm chay cho Hoàng Anh)!\n\n🔓 ĐÃ MỞ KHÓA DUY NHẤT TRẠM TIẾP THEO: Trạm 4 — Quán Cafe Sáng! Đang có 3 ứng viên: Faifo Coffee Rooftop vs Reaching Out Teahouse vs Hội An Roastery. Cả nhóm cùng bỏ phiếu nhé!'
          };
          setMessages(prev => [...prev, agentReply]);

          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + 3,
                sender: 'friend',
                name: 'Lan Vy',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: 'Hí hí ăn bánh mì xong là phải tới tiết mục cafe chụp ảnh film của em nha, để em show cho mọi người xem góc rooftop đỉnh chóp của Faifo nè!'
              }
            ]);
          }, 450);

          setDay1Stops(prev => {
            const updatedFood = prev.map(s => {
              if (s.id === 'stop-1') {
                return {
                  ...s,
                  name: 'Bánh Mì Phượng & Nước Mót',
                  votesUp: 3,
                  isSlotConfirmed: true,
                  selectedCandidateId: 'cand-food-1',
                  candidates: s.candidates?.map(c =>
                    c.id === 'cand-food-1' ? { ...c, votes: ['Hoàng Anh', 'Lan Vy', 'Minh Đức (Bạn)'] } : { ...c, votes: [] }
                  )
                };
              }
              return s;
            });

            return [
              ...updatedFood,
              {
                ...ALL_DAY_1_STOPS[3],
                name: 'Quán Cafe Sáng — [Đang Mở Bình Chọn Rooftop vs Nhà Cổ]',
                isSlotConfirmed: false,
                selectedCandidateId: undefined,
                candidates: ALL_DAY_1_STOPS[3].candidates?.map(c =>
                  c.id === 'cand-cafe-1' ? { ...c, votes: ['Lan Vy'] } : { ...c, votes: [] }
                )
              }
            ];
          });

          setActiveStopId('stop-2');
          setScriptStepIndex(5);
          triggerToast('Đã chốt trạm Điểm tâm & Mở khóa trạm Cafe sáng!');
        }, 850);
      }, 400);
    } else if (stepNum === 5) {
      // Step 5: Vote Cafe Slot -> Unlock Lunch & Rest Slot
      setActiveStopId('stop-2');

      const friendPromptMsg: ChatMessage = {
        id: Date.now(),
        sender: 'friend',
        name: 'Lan Vy',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Trạm này em xin phép nài nỉ vote Faifo Coffee nha mn ơi! Góc ban công tầng thượng nhìn trọn vẹn dãy mái ngói âm dương rêu phong nhuốm nắng vàng lên ảnh film Kodak Portra là hết nước chấm luôn á 📸☕'
      };
      setMessages(prev => [...prev, friendPromptMsg]);

      setTimeout(() => {
        const userMsg: ChatMessage = {
          id: Date.now() + 1,
          sender: 'user',
          name: 'Minh Đức (Bạn)',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: '@agent Trạm cafe sáng nhóm vote chọn Faifo Coffee Rooftop (2/3 phiếu). Chốt trạm cafe và mở khóa trạm ăn trưa để Hoàng Anh kiểm tra món chay nhé!'
        };
        setMessages(prev => [...prev, userMsg]);
        setIsConciergeTyping(true);

        setTimeout(() => {
          setIsConciergeTyping(false);
          const agentReply: ChatMessage = {
            id: Date.now() + 2,
            sender: 'concierge',
            name: 'Cố Vấn Bản Địa',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: 'Đã ghi nhận kết quả biểu quyết trạm Cafe Sáng:\n• Faifo Coffee Rooftop: 2/3 phiếu (Minh Đức, Lan Vy) — ĐẮC CỬ (view ngắm trọn mái ngói âm dương phố cổ).\n• Reaching Out Teahouse: 1/3 phiếu (Hoàng Anh) — lưu làm điểm dự phòng trong nhà khi thời tiết dông bão.\n\n🔓 ĐÃ MỞ KHÓA TRẠM 5 (Quán Ăn Trưa) VÀ TRẠM 6 (Nghỉ Trưa Phòng Lạnh Tránh Nắng)! Mời Hoàng Anh đối soát thực đơn món chay nhé!'
          };
          setMessages(prev => [...prev, agentReply]);

          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + 3,
                sender: 'friend',
                name: 'Hoàng Anh',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: 'Haha nhìn view mái ngói Faifo công nhận mê thật, chiều lòng Lan Vy nha! Cơ mà trưa nay ăn ở đâu đây @agent, nhớ check kỹ đồ chay cho mình nha!'
              }
            ]);
          }, 450);

          setDay1Stops(prev => {
            const updatedCafe = prev.map(s => {
              if (s.id === 'stop-2' && s.candidates) {
                return {
                  ...s,
                  name: 'Faifo Coffee — Ngắm Mái Ngói Phố Cổ Rooftop',
                  votesUp: 2,
                  isSlotConfirmed: true,
                  selectedCandidateId: 'cand-cafe-1',
                  candidates: s.candidates.map(c => {
                    if (c.id === 'cand-cafe-1') return { ...c, votes: ['Lan Vy', 'Minh Đức (Bạn)'] };
                    if (c.id === 'cand-cafe-2') return { ...c, votes: ['Hoàng Anh'] };
                    return { ...c, votes: [] };
                  })
                };
              }
              return s;
            });

            return [
              ...updatedCafe,
              {
                ...ALL_DAY_1_STOPS[4], // stop-3 (Ăn Trưa)
                name: 'Quán Ăn Trưa — [Đang Tư Vấn Chay & Mở Bình Chọn]',
                isSlotConfirmed: false,
                selectedCandidateId: undefined,
                candidates: ALL_DAY_1_STOPS[4].candidates?.map(c =>
                  c.id === 'cand-lunch-1' ? { ...c, votes: ['Lan Vy'] } : { ...c, votes: [] }
                )
              },
              {
                ...ALL_DAY_1_STOPS[5], // stop-rest (Nghỉ Trưa Phòng Lạnh)
                isSlotConfirmed: true
              }
            ];
          });

          setActiveStopId('stop-3');
          setScriptStepIndex(6);
          triggerToast('Đã chốt trạm Cafe & Mở khóa trạm Ăn Trưa!');
        }, 850);
      }, 400);
    } else if (stepNum === 6) {
      // Step 6: Vegetarian consultation & Confirm Lunch -> Unlock Afternoon & Evening
      setActiveStopId('stop-3');
      const userMsg: ChatMessage = {
        id: Date.now(),
        sender: 'user',
        name: 'Minh Đức (Bạn)',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: '@agent Trưa nay tại Bếp Cuốn có món chay cho Hoàng Anh không? Cả nhóm đồng thuận 3/3 vote chốt Bếp Cuốn và mở khóa các trạm chiều tối nhé!'
      };
      setMessages(prev => [...prev, userMsg]);
      setIsConciergeTyping(true);

      setTimeout(() => {
        setIsConciergeTyping(false);
        const agentReply: ChatMessage = {
          id: Date.now() + 1,
          sender: 'concierge',
          name: 'Cố Vấn Bản Địa',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Chào Hoàng Anh! Tại Bếp Cuốn Hội An có thực đơn chay riêng chuẩn vị di sản:\n• Cao Lầu nấm đùi gà xíu chay ngâm nước tro củi giếng Bá Lễ (45.000đ)\n• Mẹt Cuốn Chay Bếp Xưa: Đậu hũ non chiên giòn, ram bắp, rau thơm hữu cơ Trà Quế (110.000đ)\n• Bánh bao bánh vạc chay (Hoa Hồng Trắng) (60.000đ)\nCả nhóm đã đồng thuận 100% (3/3 phiếu) chốt Bếp Cuốn Hội An cho bữa trưa!\n\n🔓 ĐÃ MỞ KHÓA TOÀN BỘ CÁC TRẠM CÒN LẠI CỦA NGÀY 1: Chiều Đi Biển An Bàng và Tối Đi Thuyền Thả Hoa Đăng Sông Hoài!'
        };
        setMessages(prev => [...prev, agentReply]);

        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 2,
              sender: 'friend',
              name: 'Hoàng Anh',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: 'Uầy có cả Cao lầu chay ngâm nước giếng Bá Lễ chuẩn bài phố Hội à, ưng cái bụng ghê! Ăn no xong về Anio bật điều hòa ngả lưng với bơi hồ bơi tránh nắng gắt 35 độ là chuẩn bài giữ sức khỏe luôn.'
            }
          ]);

          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + 3,
                sender: 'friend',
                name: 'Lan Vy',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: 'Chiều mát 16h mình kéo nhau ra biển An Bàng ngồi ghế lười The DeckHouse ngắm hoàng hôn, tối đi thuyền gỗ thả hoa đăng sông Hoài nha mn!'
              }
            ]);
          }, 450);

          setDay1Stops(prev => {
            const updatedLunch = prev.map(s => {
              if (s.id === 'stop-3' && s.candidates) {
                return {
                  ...s,
                  name: 'Bếp Cuốn Hội An — Hương Vị Di Sản',
                  hearts: s.hearts + 2,
                  votesUp: 3,
                  isSlotConfirmed: true,
                  selectedCandidateId: 'cand-lunch-1',
                  candidates: s.candidates.map(c =>
                    c.id === 'cand-lunch-1'
                      ? { ...c, votes: ['Hoàng Anh', 'Minh Đức (Bạn)', 'Lan Vy'] }
                      : { ...c, votes: [] }
                  )
                };
              }
              return s;
            });

            return [
              ...updatedLunch,
              {
                ...ALL_DAY_1_STOPS[6], // stop-beach
                name: 'Biển An Bàng & The DeckHouse Beach Bar',
                isSlotConfirmed: true,
                votesUp: 3
              },
              {
                ...ALL_DAY_1_STOPS[7], // stop-4
                name: 'Thuyền Gỗ Thả Hoa Đăng Lung Linh Sông Hoài',
                isSlotConfirmed: true,
                votesUp: 3
              }
            ];
          });

          setActiveStopId('stop-beach');
          setScriptStepIndex(7);
          triggerToast('Đã chốt trạm Ăn Trưa & Mở khóa các trạm Chiều, Tối!');
        }, 500);
      }, 850);
    } else if (stepNum === 7) {
      // Step 7: Weather incident warning & Auto-swap & Final Lock Day 1
      const friendWarning: ChatMessage = {
        id: Date.now(),
        sender: 'friend',
        name: 'Lan Vy',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Trời ơi mọi người ơi! Em vừa check app thời tiết, 15h30 chiều nay Hội An có dông lốc mưa rào to đùng luôn á! Ban công Faifo Coffee là tầng thượng lộ thiên không có mái che, lên đấy là ướt hết máy ảnh film của em mất 😭'
      };
      setMessages(prev => [...prev, friendWarning]);

      setTimeout(() => {
        const userMsg: ChatMessage = {
          id: Date.now() + 1,
          sender: 'user',
          name: 'Minh Đức (Bạn)',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: '@agent Chiều nay trời mưa dông to, chuyển quán cafe sang Reaching Out Teahouse trong nhà ấm cúng và khóa lịch trình chính thức Ngày 1 giúp nhóm với!'
        };
        setMessages(prev => [...prev, userMsg]);
        setIsConciergeTyping(true);

        setTimeout(() => {
          setIsConciergeTyping(false);
          const agentReply: ChatMessage = {
            id: Date.now() + 2,
            sender: 'concierge',
            name: 'Cố Vấn Bản Địa',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: '⚡ TÌNH HUỐNG THỰC TẾ (ONGOING INCIDENT): Đã ghi nhận cảnh báo mưa dông lúc 15:30. Tự động kích hoạt cơ chế hoán đổi sang ứng viên trong nhà an toàn: Reaching Out Teahouse (131 Trần Phú) — không gian trà tĩnh lặng bên trong nhà gỗ cổ kính 200 năm, ấm cúng và che mưa tuyệt đối.\n\n🎉 Toàn bộ 8 trạm dừng Ngày 1 đã đạt đồng thuận 100%! Ngày 1 đã sẵn sàng hoàn hảo!'
          };
          setMessages(prev => [...prev, agentReply]);

          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + 3,
                sender: 'friend',
                name: 'Hoàng Anh',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: 'Chuẩn luôn, ngồi trong nhà gỗ cổ thưởng thức bạch trà nóng với mứt gừng ngắm mưa rơi bên khung cửa sổ thì lãng mạn hơn nhiều!'
              }
            ]);
          }, 450);

          executeAutoSwap('stop-2');
          setActiveStopId('stop-2');
          setScriptStepIndex(8);
          triggerToast('⚡ Đã hoán đổi Faifo → Reaching Out theo sự cố mưa dông!');
        }, 900);
      }, 450);
    } else if (stepNum === 8) {
      // Step 8: Move to Day 2 - Rừng dừa Cẩm Thanh & The Field
      setActiveDayTab('day2');
      const friendPromptMsg: ChatMessage = {
        id: Date.now(),
        sender: 'friend',
        name: 'Lan Vy',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Ngày 1 chốt xong quá mượt rồi! Giờ sang Ngày 2 nào mn ơi! Hôm nay đi Rừng dừa Cẩm Thanh chèo thuyền thúng xoay tít chụp ảnh sông nước đúng không anh Đức?'
      };
      setMessages(prev => [...prev, friendPromptMsg]);

      setTimeout(() => {
        const userMsg: ChatMessage = {
          id: Date.now() + 1,
          sender: 'user',
          name: 'Minh Đức (Bạn)',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: '@agent Mở tab Ngày 2: Nhóm mình biểu quyết chốt Điểm tâm Mì Quảng Bá Lễ và Thuyền thúng Bác Bảy múa thúng xoay tít (70k/người) nhé!'
        };
        setMessages(prev => [...prev, userMsg]);
        setIsConciergeTyping(true);

        setTimeout(() => {
          setIsConciergeTyping(false);
          const agentReply: ChatMessage = {
            id: Date.now() + 2,
            sender: 'concierge',
            name: 'Cố Vấn Bản Địa',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: 'Chào cả nhóm! Đã chuyển sang lộ trình Ngày 2: Rừng Dừa Bảy Mẫu & Làng Quê Cẩm Thanh!\n• Trạm 1: Đã chốt Cao Lầu & Mì Quảng Bá Lễ (có Mì quảng nấm đậu hũ chay cho Hoàng Anh 40k)\n• Trạm 2: Đã chốt Thuyền Thúng Bác Bảy (70k/vé, biểu diễn múa thúng xoay điệu nghệ & câu cua ven sông)\n\n🔓 ĐÃ MỞ KHÓA CÁC TRẠM TIẾP THEO: Bữa trưa sinh thái ven đồng The Field (thực đơn chay hữu cơ) → Nghỉ trưa hồ bơi Anio → Chiều Biển Cửa Đại & The Shore Club → Tối Chợ đêm Nguyễn Hoàng!'
          };
          setMessages(prev => [...prev, agentReply]);

          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + 3,
                sender: 'friend',
                name: 'Hoàng Anh',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: 'Nhà hàng Cánh Đồng (The Field) view cánh đồng lúa bao la có gỏi cuốn nấm hoa chuối với cơm chiên lá cẩm hạt sen chay ngon xỉu luôn mn ơi!'
              }
            ]);

            setTimeout(() => {
              setMessages(prev => [
                ...prev,
                {
                  id: Date.now() + 4,
                  sender: 'friend',
                  name: 'Lan Vy',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  text: 'Tối dạo chợ đêm Nguyễn Hoàng ăn kem ống với chè bắp ven sông Hoài nữa nha anh Đức!'
                }
              ]);
            }, 400);
          }, 450);

          // Unlock all Day 2 stops
          setDay2Stops(ALL_DAY_2_STOPS.map(s => ({ ...s, isSlotConfirmed: true, votesUp: 3 })));
          setActiveStopId('stop-d2-2');
          setScriptStepIndex(9);
          triggerToast('Đã chốt các trạm Ngày 2 & mở khóa toàn tuyến Rừng Dừa!');
        }, 900);
      }, 450);
    } else if (stepNum === 9) {
      // Step 9: Move to Day 3 - Pottery Village, Souvenirs & Final Lock
      setActiveDayTab('day3');
      const friendPromptMsg: ChatMessage = {
        id: Date.now(),
        sender: 'friend',
        name: 'Lan Vy',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Ngày 3 ngày về rồi nè, sáng sớm ăn bánh xèo giòn rụm rồi qua Làng gốm Thanh Hà nặn tò he mang về làm quà kỷ niệm nha cả nhà!'
      };
      setMessages(prev => [...prev, friendPromptMsg]);

      setTimeout(() => {
        const userMsg: ChatMessage = {
          id: Date.now() + 1,
          sender: 'user',
          name: 'Minh Đức (Bạn)',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: '@agent Sang Ngày 3: Nhóm chốt ăn sáng Bánh xèo Giếng Bá Lễ, nặn gốm Thanh Hà, mua đặc sản bánh đậu xanh nướng củi làm quà và xe 7 chỗ tiễn thẳng ga T1 sân bay DAD lúc 14h15. Host tiến hành Khóa Toàn Bộ Lịch Trình 3N2Đ luôn nhé!'
        };
        setMessages(prev => [...prev, userMsg]);
        setIsConciergeTyping(true);

        setTimeout(() => {
          setIsConciergeTyping(false);
          const agentReply: ChatMessage = {
            id: Date.now() + 2,
            sender: 'concierge',
            name: 'Cố Vấn Bản Địa',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: '🎉 CHÚC MỪNG CẢ NHÓM! Host (Minh Đức) đã chính thức Khóa Toàn Bộ Lịch Trình (Consensus Checkpoint 2: Final Lock)!\n• Ngày 1: Đón bay DAD → Anio Hotel → Bánh mì Phượng → Reaching Out Teahouse → Bếp Cuốn → Nghỉ trưa → Biển An Bàng → Thả hoa đăng sông Hoài.\n• Ngày 2: Mì Quảng Bá Lễ → Thuyền thúng Rừng dừa Cẩm Thanh → Bữa trưa The Field → Hồ bơi Anio → Biển Cửa Đại → Chợ đêm Hội An.\n• Ngày 3: Bánh xèo giếng Bá Lễ → Làng gốm đất nung Thanh Hà → Mua bánh đậu xanh nướng củi → Cơm gà Bà Buội & Xe 7 chỗ tiễn ga T1 Sân bay Đà Nẵng.\n\n✨ TỔNG CHI PHÍ: 3.450.000đ / người (Đạt 100% mục tiêu ngân sách). Chúc nhóm có chuyến đi tuyệt vời nhất!'
          };
          setMessages(prev => [...prev, agentReply]);

          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + 3,
                sender: 'friend',
                name: 'Hoàng Anh',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: 'Tuyệt vời ông mặt trời! Đầy đủ món chay, cự ly gần không lo say nắng, budget quá chuẩn chỉ!'
              }
            ]);

            setTimeout(() => {
              setMessages(prev => [
                ...prev,
                {
                  id: Date.now() + 4,
                  sender: 'friend',
                  name: 'Lan Vy',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  text: 'Em đã chuẩn bị sẵn 3 cuộn film rồi, hẹn cả nhà cuối tuần này lên đường nhaaa! ✈️🏖️'
                }
              ]);
            }, 400);
          }, 450);

          // Unlock all Day 3 stops & Final lock
          setDay3Stops(ALL_DAY_3_STOPS.map(s => ({ ...s, isSlotConfirmed: true, votesUp: 3 })));
          setActiveStopId('stop-d3-4');
          handleFinalLock();
          triggerToast('🎉 Đã chốt hoàn thiện toàn bộ chuyến đi 3N2Đ!');
        }, 1000);
      }, 450);
    }
  };

  // Reset demo back to Message #1
  const handleResetDemo = () => {
    setIsAutoPlaying(false);
    setPlanStage('empty');
    setSelectedProposalKey('A');
    setProposals(PROPOSALS);
    setActiveDayTab('overview');
    setScriptStepIndex(1);
    setMessages(INITIAL_CHAT_MESSAGES);
    setDay1Stops([]);
    setDay2Stops([]);
    setDay3Stops([]);
    setIsFinalLocked(false);
    triggerToast('Đã khởi động lại kịch bản từ câu chat đầu tiên!');
  };

  // Auto-play timer for presentation
  useEffect(() => {
    if (!isAutoPlaying) return;

    if (scriptStepIndex > 9) {
      setIsAutoPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      executeScenarioStep(scriptStepIndex);
    }, 4200);

    return () => clearTimeout(timer);
  }, [isAutoPlaying, scriptStepIndex]);

  const handleToggleAutoPlay = () => {
    if (scriptStepIndex > 9) {
      handleResetDemo();
      setIsAutoPlaying(true);
    } else {
      setIsAutoPlaying(prev => !prev);
    }
  };

  // Natural Chat Prompt Triggers (Calls @agent or group chat)
  const handleSendPrompt = (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      name: 'Minh Đức (Bạn)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text
    };
    setMessages(prev => [...prev, userMsg]);

    const isCallingAgent = text.includes('@agent');

    if (text.toLowerCase().includes('mưa')) {
      if (isCallingAgent) {
        sendConciergeReply(
          'Nhận diện tình huống thực tế phát sinh: Mưa rào lúc 15:30 tại Hội An. Vì ban công Faifo ngoài trời không có mái che, mình đã quét bán kính 100m và đề xuất phương án thay thế: Reaching Out Teahouse (131 Trần Phú) — không gian trà tĩnh lặng trong nhà gỗ cổ kính. Cả nhóm hãy bỏ phiếu biểu quyết để hệ thống tự động hoán đổi nhé!'
        );
      }

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 10,
            sender: 'friend',
            name: 'Hoàng Anh',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: 'Chuẩn luôn, mưa rào mà ngồi ban công Faifo ướt hết, mình vừa vote Đổi điểm rồi đó!'
          }
        ]);

        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 20,
              sender: 'friend',
              name: 'Lan Vy',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: 'Em cũng vừa bấm vote Đổi sang quán trà cổ kính trong nhà rồi nè, đủ 3/3 phiếu luôn rồi!'
            }
          ]);
          executeAutoSwap('stop-2');
        }, 900);
      }, isCallingAgent ? 1200 : 700);
    } else if (text.toLowerCase().includes('món chay') || text.toLowerCase().includes('ăn')) {
      sendConciergeReply(
        'Tại Bếp Cuốn Hội An có món Cao Lầu nấm đùi gà xíu hoàn toàn chay cho Hoàng Anh, và mẹt cuốn rau tươi Trà Quế rất thanh mát. Cả nhóm có thể bấm "Món Khuyên Thử" trên thẻ để xem menu chi tiết nhé!'
      );
    } else if (text.toLowerCase().includes('chốt')) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: 'friend',
            name: 'Hoàng Anh',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: 'Lịch trình quá ưng ý rồi, các trạm cự ly đi bộ đều dưới 500m. Anh Đức bấm chốt đi!'
          },
          {
            id: Date.now() + 1,
            sender: 'friend',
            name: 'Lan Vy',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: 'Em cũng duyệt 100% rồi nha! 🎉'
          }
        ]);
        triggerToast('Cả nhóm đã đồng thuận 100%! Bạn có thể bấm "Xác Nhận & Khóa Lịch Trình".');
      }, 700);
    } else if (isCallingAgent) {
      if (planStage === 'empty') {
        executeScenarioStep(1);
      } else if (planStage === 'proposals') {
        executeScenarioStep(2);
      } else {
        sendConciergeReply(
          'Cố vấn bản địa nghe đây! Nhóm đã có lịch trình chi tiết. Bạn cần tìm điểm dừng tránh mưa, tư vấn món ăn đặc sản vùng miền hay tính toán cự ly di chuyển cho nhóm?'
        );
      }
    } else {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: 'friend',
            name: 'Hoàng Anh',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: 'Nhất trí luôn nha!'
          }
        ]);
      }, 600);
    }
  };

  // Send free text chat or advance script step if input is empty
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) {
      if (scriptStepIndex <= 9) {
        executeScenarioStep(scriptStepIndex);
      }
      return;
    }
    const txt = inputMsg;
    setInputMsg('');
    handleSendPrompt(txt);
  };

  // Host Final Lock
  const handleFinalLock = () => {
    setIsFinalLocked(true);
    setPlanStage('finalized');
    confetti({
      particleCount: 130,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#d99726', '#bf5431', '#264e41', '#0e2238']
    });
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'concierge',
        name: 'Hệ Thống',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: '🎉 CHÚC MỪNG CẢ NHÓM! Host đã khóa lịch trình chính thức. Trạng thái đồng thuận hoàn tất, sẵn sàng lên đường!',
        isSystemEvent: true
      }
    ]);
    triggerToast('🎉 Đã chốt lịch chính thức & khóa bình chọn!');
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans bg-canvas">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isLoggedIn={isLoggedIn}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={() => { setIsLoggedIn(false); setCurrentTab('landing'); triggerToast('Đã đăng xuất.'); }}
        onStartPlanning={() => {
          if (!isLoggedIn) setIsAuthModalOpen(true);
          else setCurrentTab('room');
        }}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-pureWhite px-4 py-3 rounded-xl shadow-xl border border-ochre/30 flex items-center gap-3 transition-all animate-bounce">
          <span className="w-2 h-2 rounded-full bg-ochre"></span>
          <span className="text-xs font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {currentTab === 'landing' && (
          <div className="relative overflow-hidden pb-10">
            {/* HERO WITH WORLD MAP BACKGROUND */}
            <div className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center border-b border-ash overflow-hidden">
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: `url(${worldMapBg})`,
                  filter: 'contrast(1.02) brightness(1.01)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-canvas/35 via-canvas/55 to-canvas/90"></div>
              </div>

              <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pureWhite/90 backdrop-blur-sm border border-ochre/30 text-ochre text-xs font-semibold uppercase tracking-wider mb-5 shadow-sm">
                  <span>Bespoke Editorial Travel Journal</span>
                </div>
                <h1 className="text-4xl sm:text-6xl text-ink font-extrabold tracking-tight leading-[1.15]">
                  Hành Trình Gắn Kết. <br />
                  <span className="italic font-normal text-terracotta">Xé Dán Cảm Xúc</span> Cùng Nhau.
                </h1>
                <p className="mt-5 text-base sm:text-lg text-graphite leading-relaxed max-w-2xl mx-auto font-sans font-medium">
                  Tạm biệt bảng tính khô khan. Trải nghiệm không gian lên lịch trình đồng thuận nghệ thuật: tự do bình chọn, đổi điểm dừng khi trời mưa, và chu du khắp cảnh quan thế giới & Việt Nam.
                </p>

                {/* Custom Synchronized Planning Bar */}
                <div className="mt-6">
                  <PlanningBar onStartPlanning={() => {
                    if (!isLoggedIn) setIsAuthModalOpen(true);
                    else setCurrentTab('room');
                  }} />
                </div>
              </div>
            </div>

            {/* VIETNAM SCRAPBOOK */}
            <div id="scrapbook" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
              <TornPaperCollage
                destinations={VIETNAM_COLLAGE_DESTINATIONS}
                onSelectDestination={(_dest: Destination) => {
                  if (!isLoggedIn) setIsAuthModalOpen(true);
                  else setCurrentTab('room');
                }}
              />

              {/* PRODUCT FEATURE SHOWCASE */}
              <FeatureShowcase />
            </div>

            {/* PRODUCT FOOTER */}
            <Footer />
          </div>
        )}

        {currentTab === 'room' && (
          <div className="max-w-[1600px] mx-auto px-2 sm:px-4 py-4 h-[calc(100vh-65px)] flex flex-col">
            {/* Room Workspace Subheader */}
            <div className="bg-pureWhite p-3 rounded-xl border border-ash shadow-sm mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${isFinalLocked ? 'bg-moss' : stops.length === 0 ? 'bg-muted' : 'bg-ochre'}`}></span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-ink">Chuyến Đi Đà Nẵng — Hội An 3 Ngày 2 Đêm</h2>
                    {isFinalLocked ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-moss text-pureWhite uppercase tracking-wider">
                        🔒 ĐÃ CHỐT CHÍNH THỨC (FINALIZED)
                      </span>
                    ) : planStage === 'empty' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface text-graphite border border-ash/80">
                        💬 Giai Đoạn 0: Bàn Bạc Ý Kiến Nhóm
                      </span>
                    ) : planStage === 'proposals' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-ochre/15 text-ochre border border-ochre/30">
                        ⚡ Giai Đoạn 1: Lựa Chọn Phương Án Tổng Thể (A / B / C)
                      </span>
                    ) : stops.some(s => s.isSwapped) ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-terracotta text-pureWhite">
                        🌧️ Giai Đoạn 2: Đã Tự Động Đổi Điểm Mưa (Ongoing)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-moss/15 text-moss border border-moss/30">
                        📋 Giai Đoạn 2: Lịch Trình Chi Tiết Từng Trạm
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted">
                    {planStage === 'empty'
                      ? 'Chưa khởi tạo lịch trình • Hãy gửi tin nhắn @agent để nhận 3 Phương Án Tổng Thể'
                      : planStage === 'proposals'
                      ? 'Cả nhóm đang xem xét 3 đề xuất định hướng trước khi bung lịch chi tiết'
                      : 'Lộ trình: Sân bay Đà Nẵng (DAD) → Anio Hotel → Phố Cổ Hội An (8 trạm dừng chi tiết)'}
                  </p>
                </div>
              </div>

              {/* Host Action Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFinalLock}
                  disabled={isFinalLocked || stops.length === 0}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isFinalLocked
                      ? 'bg-ash text-muted cursor-not-allowed'
                      : stops.length === 0
                      ? 'bg-ash/50 text-muted cursor-not-allowed border border-ash'
                      : 'bg-moss text-pureWhite hover:bg-moss/90 shadow'
                  }`}
                  title="Host xác nhận chốt toàn bộ lịch trình và khóa bình chọn"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isFinalLocked ? 'Đã Khóa Lịch Trình' : 'Xác Nhận & Khóa Lịch Trình'}</span>
                </button>
              </div>
            </div>

            {/* 3-Pane Split Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
              <ChatPanel
                messages={messages}
                inputMsg={inputMsg}
                setInputMsg={setInputMsg}
                isConciergeTyping={isConciergeTyping}
                onSendChat={handleSendChat}
                onSendPrompt={handleSendPrompt}
                onApplyOption={(opt) => {
                  handleConfirmProposal(opt);
                }}
                currentStepIndex={scriptStepIndex}
                nextStep={DEMO_SCENARIO_STEPS.find(s => s.stepIndex === scriptStepIndex) || null}
                onExecuteNextStep={() => executeScenarioStep(scriptStepIndex)}
                onResetDemo={handleResetDemo}
                isAutoPlaying={isAutoPlaying}
                onToggleAutoPlay={handleToggleAutoPlay}
              />

              <TimelinePanel
                planStage={planStage}
                proposals={proposals}
                selectedProposalKey={selectedProposalKey}
                onSelectProposal={(key) => setSelectedProposalKey(key)}
                onVoteProposal={handleVoteProposal}
                onConfirmProposal={handleConfirmProposal}
                stops={stops}
                activeStopId={activeStopId}
                setActiveStopId={setActiveStopId}
                onVote={handleVote}
                onVoteCandidate={handleVoteCandidate}
                onConfirmStop={handleConfirmStop}
                onOpenFoodModal={(stop) => setSelectedFoodStop(stop)}
                activeDayTab={activeDayTab}
                setActiveDayTab={(tab) => {
                  setActiveDayTab(tab);
                  if (tab === 'day1' && day1Stops.length > 0) setActiveStopId(day1Stops[0].id);
                  if (tab === 'day2' && day2Stops.length > 0) setActiveStopId(day2Stops[0].id);
                  if (tab === 'day3' && day3Stops.length > 0) setActiveStopId(day3Stops[0].id);
                }}
                day1Count={day1Stops.length}
                day2Count={day2Stops.length}
                day3Count={day3Stops.length}
              />

              <MapPanel
                stops={stops}
                activeStopId={activeStopId}
                setActiveStopId={setActiveStopId}
              />
            </div>
          </div>
        )}

        {currentTab === 'checklist' && (
          <ChecklistView onGoToRoom={() => setCurrentTab('room')} />
        )}

        {currentTab === 'admin' && (
          <AdminView />
        )}
      </main>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsLoggedIn(true);
            setIsAuthModalOpen(false);
            setCurrentTab('room');
            triggerToast('Đăng nhập thành công! Chào mừng bạn đến phòng làm việc nhóm.');
          }}
        />
      )}

      {/* Food Specialties Modal */}
      {selectedFoodStop && (
        <FoodModal
          stop={selectedFoodStop}
          onClose={() => setSelectedFoodStop(null)}
        />
      )}
    </div>
  );
}
