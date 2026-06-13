<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UnreadCountUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $userId,
        public int $count,
    ) {}

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.'.$this->userId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'unread.updated';
    }

    /**
     * @return array<string, int>
     */
    public function broadcastWith(): array
    {
        return [
            'count' => $this->count,
        ];
    }
}
