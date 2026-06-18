import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

let app: ReturnType<typeof createApp>;

beforeEach(() => {
  app = createApp();
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// POST /api/drones
// ---------------------------------------------------------------------------
describe('POST /api/drones', () => {
  it('creates a drone event and returns 201 with full shape', async () => {
    const res = await request(app)
      .post('/api/drones')
      .send({ label: 'DJI-Phantom-001', threatLevel: 'high' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.label).toBe('DJI-Phantom-001');
    expect(res.body.threatLevel).toBe('high');
    expect(res.body.status).toBe('active');
    expect(res.body.detectedAt).toBeDefined();
  });

  it('returns 400 when label is missing', async () => {
    const res = await request(app).post('/api/drones').send({ threatLevel: 'high' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when threatLevel is invalid', async () => {
    const res = await request(app)
      .post('/api/drones')
      .send({ label: 'DJI-001', threatLevel: 'critical' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/api/drones').send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// GET /api/drones
// ---------------------------------------------------------------------------
describe('GET /api/drones', () => {
  beforeEach(async () => {
    await request(app).post('/api/drones').send({ label: 'Alpha', threatLevel: 'high' });
    await request(app).post('/api/drones').send({ label: 'Bravo', threatLevel: 'medium' });
    await request(app).post('/api/drones').send({ label: 'Charlie', threatLevel: 'low' });
  });

  it('returns paginated list with all five required fields', async () => {
    const res = await request(app).get('/api/drones').query({ page: 1, limit: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.total).toBe(3);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(2);
  });

  it('second page returns remaining item', async () => {
    const res = await request(app).get('/api/drones').query({ page: 2, limit: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('filters by threatLevel=high', async () => {
    const res = await request(app).get('/api/drones').query({ threatLevel: 'high' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].threatLevel).toBe('high');
  });

  it('filters by status=active returns all (nothing mitigated yet)', async () => {
    const res = await request(app).get('/api/drones').query({ status: 'active' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  it('filters by status=mitigated returns empty when none mitigated', async () => {
    const res = await request(app).get('/api/drones').query({ status: 'mitigated' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });

  it('returns 400 for page=0', async () => {
    const res = await request(app).get('/api/drones').query({ page: 0 });

    expect(res.status).toBe(400);
  });

  it('returns 400 for limit exceeding max (100)', async () => {
    const res = await request(app).get('/api/drones').query({ limit: 200 });

    expect(res.status).toBe(400);
  });

  it('returns empty list when store is empty', async () => {
    const freshApp = createApp();
    const res = await request(freshApp).get('/api/drones');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.total).toBe(0);
    expect(res.body.totalPages).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/drones/:id
// ---------------------------------------------------------------------------
describe('PATCH /api/drones/:id', () => {
  let droneId: string;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/drones')
      .send({ label: 'Delta', threatLevel: 'high' });
    droneId = res.body.id;
  });

  it('mitigates an active drone and returns 200', async () => {
    const res = await request(app)
      .patch(`/api/drones/${droneId}`)
      .send({ status: 'mitigated' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('mitigated');
    expect(res.body.id).toBe(droneId);
  });

  it('dismisses an active drone and returns 200', async () => {
    const res = await request(app)
      .patch(`/api/drones/${droneId}`)
      .send({ status: 'dismissed' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('dismissed');
  });

  it('returns 409 when trying to update an already-mitigated drone', async () => {
    await request(app).patch(`/api/drones/${droneId}`).send({ status: 'mitigated' });

    const res = await request(app)
      .patch(`/api/drones/${droneId}`)
      .send({ status: 'dismissed' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
  });

  it('returns 404 for a non-existent id', async () => {
    const res = await request(app)
      .patch('/api/drones/00000000-0000-0000-0000-000000000000')
      .send({ status: 'mitigated' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when status is "active" (not a valid transition)', async () => {
    const res = await request(app)
      .patch(`/api/drones/${droneId}`)
      .send({ status: 'active' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app).patch(`/api/drones/${droneId}`).send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// GET /health
// ---------------------------------------------------------------------------
describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
